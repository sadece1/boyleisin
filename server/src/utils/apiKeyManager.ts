import crypto from 'crypto';
import { RowDataPacket } from 'mysql2';
import db from '../config/database';
import logger from './logger';
import { logSecurityEvent, logAdminAction, SecurityEventType } from './securityLogger';

interface ApiKey {
  id: string;
  key: string;
  keyHash: string;
  userId: string;
  name: string;
  permissions: string[];
  rateLimit?: number;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}

/**
 * API Key Manager
 * Handles API key generation, validation, and rate limiting
 */

// In-memory cache for API keys (production'da Redis kullanılmalı)
const apiKeyCache = new Map<string, ApiKey>();

/**
 * Generate API key
 */
export const generateApiKey = (): { key: string; keyHash: string } => {
  const key = `csk_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, keyHash };
};

/**
 * Hash API key
 */
export const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Create API key for user
 */
export const createApiKey = async (
  userId: string,
  name: string,
  permissions: string[] = [],
  rateLimit?: number,
  expiresInDays?: number
): Promise<{ key: string; id: string }> => {
  const { key, keyHash } = generateApiKey();
  const id = crypto.randomUUID();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const query = `
    INSERT INTO api_keys (id, key_hash, user_id, name, permissions, rate_limit, expires_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `;

  await db.execute(query, [
    id,
    keyHash,
    userId,
    name,
    JSON.stringify(permissions),
    rateLimit || null,
    expiresAt,
  ]);

  logAdminAction(userId, 'API_KEY_CREATED', id, { name, permissions });

  return { key, id };
};

/**
 * Validate API key
 */
export const validateApiKey = async (
  key: string
): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> => {
  const keyHash = hashApiKey(key);

  // Check cache first
  const cached = apiKeyCache.get(keyHash);
  if (cached && cached.isActive) {
    if (cached.expiresAt && new Date() > cached.expiresAt) {
      apiKeyCache.delete(keyHash);
      return { valid: false, error: 'API key expired' };
    }
    return { valid: true, apiKey: cached };
  }

  // Query database
  const query = `
    SELECT * FROM api_keys
    WHERE key_hash = ? AND is_active = 1
  `;

  const [rows] = await db.execute<RowDataPacket[]>(query, [keyHash]);

  if (!rows || rows.length === 0) {
    logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
      details: { reason: 'Invalid API key' },
      severity: 'medium',
    });
    return { valid: false, error: 'Invalid API key' };
  }

  const apiKey: ApiKey = {
    id: rows[0].id,
    key: '', // Never return the actual key
    keyHash: rows[0].key_hash,
    userId: rows[0].user_id,
    name: rows[0].name,
    permissions: JSON.parse(rows[0].permissions || '[]'),
    rateLimit: rows[0].rate_limit,
    lastUsed: rows[0].last_used ? new Date(rows[0].last_used) : undefined,
    expiresAt: rows[0].expires_at ? new Date(rows[0].expires_at) : undefined,
    createdAt: new Date(rows[0].created_at),
    isActive: rows[0].is_active === 1,
  };

  // Check expiration
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    return { valid: false, error: 'API key expired' };
  }

  // Update last used
  await updateApiKeyLastUsed(apiKey.id);

  // Cache it
  apiKeyCache.set(keyHash, apiKey);

  return { valid: true, apiKey };
};

/**
 * Update API key last used timestamp
 */
const updateApiKeyLastUsed = async (id: string): Promise<void> => {
  const query = `UPDATE api_keys SET last_used = NOW() WHERE id = ?`;
  await db.execute(query, [id]);
};

/**
 * Revoke API key
 */
export const revokeApiKey = async (id: string, userId: string): Promise<void> => {
  const query = `UPDATE api_keys SET is_active = 0 WHERE id = ? AND user_id = ?`;
  await db.execute(query, [id, userId]);

  // Remove from cache
  apiKeyCache.forEach((value, key) => {
    if (value.id === id) {
      apiKeyCache.delete(key);
    }
  });

  logAdminAction(userId, 'API_KEY_REVOKED', id);
};

/**
 * Rotate API key (revoke old, create new)
 */
export const rotateApiKey = async (
  oldId: string,
  userId: string,
  name: string
): Promise<{ key: string; id: string }> => {
  await revokeApiKey(oldId, userId);
  return createApiKey(userId, name);
};

/**
 * Get user API keys
 */
export const getUserApiKeys = async (userId: string): Promise<Omit<ApiKey, 'key' | 'keyHash'>[]> => {
  const query = `
    SELECT id, user_id, name, permissions, rate_limit, last_used, expires_at, created_at, is_active
    FROM api_keys
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    permissions: JSON.parse(row.permissions || '[]'),
    rateLimit: row.rate_limit,
    lastUsed: row.last_used ? new Date(row.last_used) : undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    createdAt: new Date(row.created_at),
    isActive: row.is_active === 1,
  }));
};












