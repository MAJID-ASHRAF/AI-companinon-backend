import { db } from '../config/db.js';
import { decisionEngine } from '../services/ai/decisionEngine.js';

/**
 * Health check controller.
 * Returns system health status.
 */
export const healthController = {
  /**
   * Basic health check
   */
  async getHealth(req, res) {
    res.json({ status: 'ok' });
  },

  /**
   * Detailed health check with dependency status
   */
  async getDetailedHealth(req, res) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {},
    };

    // Check database
    try {
      await db.query('SELECT 1');
      health.checks.database = { status: 'ok' };
    } catch (error) {
      health.checks.database = { 
        status: 'error', 
        message: 'Database connection failed' 
      };
      health.status = 'degraded';
    }

    // Check OpenAI (optional, skip if not configured)
    if (process.env.OPENAI_API_KEY) {
      try {
        const aiHealth = await decisionEngine.healthCheck();
        health.checks.openai = aiHealth;
        if (aiHealth.status !== 'ok') {
          health.status = 'degraded';
        }
      } catch (error) {
        health.checks.openai = { 
          status: 'error', 
          message: 'OpenAI check failed' 
        };
        health.status = 'degraded';
      }
    } else {
      health.checks.openai = { 
        status: 'unconfigured', 
        message: 'API key not set' 
      };
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  },

  /**
   * Readiness check for load balancers
   */
  async getReady(req, res) {
    try {
      await db.query('SELECT 1');
      res.json({ ready: true });
    } catch (error) {
      res.status(503).json({ ready: false, reason: 'database' });
    }
  },
};

