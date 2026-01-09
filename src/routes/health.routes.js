import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/', healthController.getHealth);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check with dependency status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                     openai:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *       503:
 *         description: One or more dependencies are unhealthy
 */
router.get('/detailed', healthController.getDetailedHealth);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check for load balancers
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready to accept requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ready:
 *                   type: boolean
 *                   example: true
 *       503:
 *         description: Server is not ready
 */
router.get('/ready', healthController.getReady);

export default router;
