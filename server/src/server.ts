import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testConnection } from './config/database';
import { validateEnv } from './utils/envValidator';
import logger from './utils/logger';

// Validate environment variables on startup
try {
  validateEnv();
  logger.info('✅ Environment variables validated');
} catch (error: any) {
  logger.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`📡 API endpoint: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();


