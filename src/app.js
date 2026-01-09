import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { swaggerSpec } from './config/swagger.js';

// Route imports
import healthRoutes from './routes/health.routes.js';
import decisionRoutes from './routes/decision.routes.js';
import taskRoutes from './routes/task.routes.js';
import sessionRoutes from './routes/session.routes.js';

/**
 * Creates and configures the Express application.
 * Separated from server.js for easier testing.
 */
export function createApp() {
  const app = express();

  // ======================
  // MIDDLEWARE
  // ======================
  
  // Parse JSON bodies
  app.use(express.json({ limit: '1mb' }));
  
  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));
  
  // Request logging
  app.use(requestLogger({
    logBody: process.env.NODE_ENV === 'development',
    excludePaths: ['/health'],
  }));

  // CORS headers (simple setup, expand as needed)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ======================
  // SWAGGER DOCS
  // ======================
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI Personal Assistant API',
  }));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
  });

  // ======================
  // ROUTES
  // ======================

  // Health check routes
  app.use('/health', healthRoutes);

  // Session routes (thinking-phase engine)
  app.use('/session', sessionRoutes);

  // Decision routes (legacy - will be deprecated)
  app.use('/decision', decisionRoutes);

  // Task routes (legacy - will be deprecated)
  app.use('/task', taskRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'AI Personal Assistant API',
      version: '2.0.0',
      description: 'Thinking-phase engine for guided mental clarity',
      documentation: '/api-docs',
      endpoints: {
        session: '/session (thinking phases)',
        health: '/health',
        decision: '/decision (legacy)',
        task: '/task (legacy)',
      },
    });
  });

  // ======================
  // ERROR HANDLING
  // ======================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

