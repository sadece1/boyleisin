/**
 * Environment Variables Validation
 * Ensures all required environment variables are set and valid
 */

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

/**
 * Validate environment variables
 */
export const validateEnv = (): void => {
  const required = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
  ];

  const missing: string[] = [];

  required.forEach((key) => {
    // In development, DB_PASSWORD can be empty
    if (key === 'DB_PASSWORD' && process.env.NODE_ENV === 'development') {
      return; // Skip DB_PASSWORD check in development
    }
    // In development, JWT_SECRET can be missing (will use default)
    if (key === 'JWT_SECRET' && process.env.NODE_ENV === 'development') {
      return; // Skip JWT_SECRET check in development
    }
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
  }

  // In development, allow empty JWT_SECRET but warn
  if (process.env.NODE_ENV === 'development' && !process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set. Using default development secret.');
    process.env.JWT_SECRET = 'development-secret-key-change-in-production-min-32-chars';
  }

  // In development, allow empty DB_PASSWORD (for local MySQL without password)
  if (process.env.NODE_ENV === 'development' && !process.env.DB_PASSWORD) {
    console.warn('⚠️  WARNING: DB_PASSWORD is not set. Using empty password for local MySQL.');
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
  }

  // Validate PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a number between 1 and 65535');
    }
  }
};

/**
 * Get environment variable with default value
 */
export const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || defaultValue || '';
};

/**
 * Get environment variable as number
 */
export const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    console.warn(`Invalid number for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return num;
};

/**
 * Get environment variable as boolean
 */
export const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};






