import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createApiKey,
  getUserApiKeys,
  revokeApiKey,
  rotateApiKey,
} from '../utils/apiKeyManager';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Create API key
 */
export const createApiKeyController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { name, permissions = [], rateLimit, expiresInDays } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'API key name is required',
      });
      return;
    }

    const { key, id } = await createApiKey(
      req.user.id,
      name,
      permissions,
      rateLimit,
      expiresInDays
    );

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: {
        id,
        key, // Only shown once!
        name,
        permissions,
        rateLimit,
      },
    });
  }
);

/**
 * Get user's API keys
 */
export const getUserApiKeysController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const apiKeys = await getUserApiKeys(req.user.id);

    res.status(200).json({
      success: true,
      data: apiKeys,
    });
  }
);

/**
 * Revoke API key
 */
export const revokeApiKeyController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    await revokeApiKey(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
    });
  }
);

/**
 * Rotate API key
 */
export const rotateApiKeyController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const { name } = req.body;

    const { key, id: newId } = await rotateApiKey(id, req.user.id, name || 'Rotated Key');

    res.status(200).json({
      success: true,
      message: 'API key rotated successfully',
      data: {
        id: newId,
        key, // Only shown once!
        name: name || 'Rotated Key',
      },
    });
  }
);












