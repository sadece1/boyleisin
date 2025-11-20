import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { UserPayload } from '../types';

/**
 * Token Manager - JWT and Refresh Token Management
 */

// In-memory token blacklist (production'da Redis kullanılmalı)
const tokenBlacklist = new Set<string>();
const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();

const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const BLACKLIST_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Generate access token
 */
export const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const token = jwt.sign({ userId, type: 'refresh' }, jwtConfig.secret, {
    expiresIn: '30d',
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
  refreshTokens.set(token, { userId, expiresAt });

  return token;
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): UserPayload | null => {
  try {
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return null;
    }

    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as UserPayload;

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    }) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      return null;
    }

    // Check if refresh token exists in store
    const stored = refreshTokens.get(token);
    if (!stored || new Date() > stored.expiresAt) {
      refreshTokens.delete(token);
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
};

/**
 * Add token to blacklist (for logout)
 */
export const blacklistToken = (token: string, expiresIn: number): void => {
  tokenBlacklist.add(token);
  // Remove from blacklist after token expires
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, expiresIn * 1000);
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = (token: string): void => {
  refreshTokens.delete(token);
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllUserTokens = (userId: string): void => {
  refreshTokens.forEach((value, key) => {
    if (value.userId === userId) {
      refreshTokens.delete(key);
    }
  });
};

/**
 * Cleanup expired refresh tokens
 */
const cleanupExpiredTokens = (): void => {
  const now = new Date();
  refreshTokens.forEach((value, key) => {
    if (now > value.expiresAt) {
      refreshTokens.delete(key);
    }
  });
};

// Cleanup every hour
setInterval(cleanupExpiredTokens, BLACKLIST_CLEANUP_INTERVAL);

/**
 * Rotate refresh token (revoke old, generate new)
 */
export const rotateRefreshToken = (oldToken: string, userId: string): string => {
  revokeRefreshToken(oldToken);
  return generateRefreshToken(userId);
};












