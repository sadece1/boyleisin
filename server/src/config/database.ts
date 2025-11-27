import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  enableKeepAlive: boolean;
  keepAliveInitialDelay: number;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campscape_marketplace',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Note: acquireTimeout, timeout, and reconnect are not valid options for mysql2/promise pool
  // These options are handled internally by the pool
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Track connection health
let isConnectionHealthy = false;
let lastConnectionError: Error | null = null;
let connectionRetryCount = 0;
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

/**
 * Test database connection with retry logic
 */
export const testConnection = async (retries: number = MAX_RETRY_COUNT): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
  try {
    const connection = await pool.getConnection();
      await connection.ping();
    connection.release();
      
      isConnectionHealthy = true;
      lastConnectionError = null;
      connectionRetryCount = 0;
      
      logger.info('✅ Database connection established successfully');
      return;
    } catch (error: any) {
      lastConnectionError = error;
      isConnectionHealthy = false;
      connectionRetryCount = attempt;
      
      logger.error(`❌ Database connection attempt ${attempt}/${retries} failed:`, {
        error: error.message,
        code: error.code,
        errno: error.errno,
      });
      
      // If not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  
  // All retries failed
  throw new Error(
    `Database connection failed after ${retries} attempts. Last error: ${lastConnectionError?.message}`
  );
};

/**
 * Get database connection health status
 */
export const getConnectionHealth = () => {
  return {
    healthy: isConnectionHealthy,
    lastError: lastConnectionError?.message || null,
    retryCount: connectionRetryCount,
    poolStats: {
      totalConnections: (pool as any).pool?._allConnections?.length || 0,
      freeConnections: (pool as any).pool?._freeConnections?.length || 0,
      queuedRequests: (pool as any).pool?._connectionQueue?.length || 0,
    },
  };
};

/**
 * Monitor database connection health periodically
 */
let healthCheckInterval: NodeJS.Timeout | null = null;

export const startConnectionMonitoring = (intervalMs: number = 30000) => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(async () => {
    try {
      await testConnection(1); // Single attempt for monitoring
  } catch (error) {
      logger.warn('Database health check failed (monitoring only):', {
        error: (error as Error).message,
      });
    }
  }, intervalMs);
  
  logger.info(`Database connection monitoring started (interval: ${intervalMs}ms)`);
};

export const stopConnectionMonitoring = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    logger.info('Database connection monitoring stopped');
  }
};

// Note: mysql2/promise pool doesn't expose 'connection' or 'error' events directly
// Connection errors are handled in testConnection() and individual query handlers

export default pool;













