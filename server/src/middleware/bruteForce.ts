import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface LoginAttempt {
  count: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

// In-memory store for login attempts (production'da Redis kullanılmalı)
const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

/**
 * Get client identifier (IP address)
 */
const getClientId = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Clean up old attempts
 */
const cleanupAttempts = () => {
  const now = new Date();
  loginAttempts.forEach((attempt, key) => {
    if (
      attempt.blockedUntil &&
      now > attempt.blockedUntil &&
      now.getTime() - attempt.lastAttempt.getTime() > ATTEMPT_WINDOW
    ) {
      loginAttempts.delete(key);
    }
  });
};

// Cleanup every 5 minutes
setInterval(cleanupAttempts, 5 * 60 * 1000);

/**
 * Brute Force Protection Middleware
 */
export const bruteForceProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientId = getClientId(req);
  const now = new Date();

  cleanupAttempts();

  const attempt = loginAttempts.get(clientId);

  // Check if IP is blocked
  if (attempt?.blockedUntil && now < attempt.blockedUntil) {
    const remainingTime = Math.ceil(
      (attempt.blockedUntil.getTime() - now.getTime()) / 1000 / 60
    );
    logger.warn(`Brute force protection: IP ${clientId} is blocked for ${remainingTime} more minutes`);
    res.status(429).json({
      success: false,
      error: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
    });
    return;
  }

  // Reset attempts if window expired
  if (attempt && now.getTime() - attempt.lastAttempt.getTime() > ATTEMPT_WINDOW) {
    loginAttempts.delete(clientId);
    next();
    return;
  }

  next();
};

/**
 * Record failed login attempt
 */
export const recordFailedAttempt = (req: Request): void => {
  const clientId = getClientId(req);
  const now = new Date();

  const attempt = loginAttempts.get(clientId) || { count: 0, lastAttempt: now };

  attempt.count += 1;
  attempt.lastAttempt = now;

  // Block if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = new Date(now.getTime() + BLOCK_DURATION);
    logger.warn(
      `Brute force protection: IP ${clientId} blocked after ${MAX_ATTEMPTS} failed attempts`
    );
  }

  loginAttempts.set(clientId, attempt);
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (req: Request): void => {
  const clientId = getClientId(req);
  loginAttempts.delete(clientId);
};












