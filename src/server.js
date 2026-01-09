import { createApp } from './app.js';
import { env } from './config/env.js';
import { db } from './config/db.js';

/**
 * Server entry point.
 * Starts the Express server and handles graceful shutdown.
 */

const app = createApp();
const PORT = env.port;

// AI provider info
const aiProvider = env.ai.provider 
  ? `${env.ai.provider} (${env.ai.model})` 
  : 'NOT CONFIGURED';

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🧠 AI Personal Assistant API                             ║
║                                                            ║
║   Server running on port ${String(PORT).padEnd(33)}║
║   Environment: ${env.nodeEnv.padEnd(41)}║
║   AI Provider: ${aiProvider.padEnd(41)}║
║                                                            ║
║   Endpoints:                                               ║
║   • GET  /health          - Health check                   ║
║   • POST /decision        - Generate decision              ║
║   • GET  /api-docs        - Swagger documentation          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// ======================
// GRACEFUL SHUTDOWN
// ======================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      // Close database connections
      await db.close();
      console.log('Database connections closed.');
      
      console.log('Graceful shutdown complete.');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejection, just log it
});

export { app, server };

