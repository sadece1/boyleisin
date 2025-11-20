import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AuthRequest, UserPayload } from '../types';
import logger from '../utils/logger';

/**
 * JWT Authentication Middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided', {
        url: req.originalUrl,
        method: req.method,
      });
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as UserPayload;
      req.user = decoded;
      logger.debug('Authentication successful', { userId: decoded.id });
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn('Authentication failed: Token expired');
        res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
        return;
      } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn('Authentication failed: Invalid token', { error: error.message });
        res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
        });
        return;
      }
      // Unexpected error
      logger.error('Unexpected authentication error:', error);
      res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.',
      });
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication error. Please try again.',
    });
  }
};

/**
 * Admin Authorization Middleware
 */
export const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }

  next();
};

/**
 * Optional Authentication Middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, jwtConfig.secret) as UserPayload;
        req.user = decoded;
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }

    next();
  } catch (error) {
    next(); // Continue even if there's an error
  }
};
