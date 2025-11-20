import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { generateId } from '../utils/helpers';
import logger from '../utils/logger';

/**
 * CSRF Token Generation and Validation
 */

// In-memory token store (production'da Redis kullanılmalı)
const csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (req: Request): string => {
  const sessionId = (req as any).session?.id || req.headers['x-session-id'] || generateId();
  const token = generateId();
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_EXPIRY);

  csrfTokens.set(sessionId, { token, expiresAt });

  // Cleanup expired tokens
  cleanupExpiredTokens();

  return token;
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const sessionId = (req as any).session?.id || req.headers['x-session-id'];
  const token = req.headers['x-csrf-token'] as string;

  if (!sessionId || !token) {
    logger.warn('CSRF validation failed: Missing token or session');
    res.status(403).json({
      success: false,
      error: 'CSRF token missing or invalid',
    });
    return;
  }

  const stored = csrfTokens.get(sessionId);

  if (!stored || stored.token !== token) {
    logger.warn('CSRF validation failed: Token mismatch');
    res.status(403).json({
      success: false,
      error: 'CSRF token invalid',
    });
    return;
  }

  if (new Date() > stored.expiresAt) {
    csrfTokens.delete(sessionId);
    logger.warn('CSRF validation failed: Token expired');
    res.status(403).json({
      success: false,
      error: 'CSRF token expired',
    });
    return;
  }

  next();
};

/**
 * Cleanup expired tokens
 */
const cleanupExpiredTokens = (): void => {
  const now = new Date();
  csrfTokens.forEach((value, key) => {
    if (now > value.expiresAt) {
      csrfTokens.delete(key);
    }
  });
};

// Cleanup every 10 minutes
setInterval(cleanupExpiredTokens, 10 * 60 * 1000);

/**
 * Get CSRF token endpoint handler
 */
export const getCSRFToken = (req: Request, res: Response): void => {
  const token = generateCSRFToken(req);
  res.json({
    success: true,
    data: { csrfToken: token },
  });
};












