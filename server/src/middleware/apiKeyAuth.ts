import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { validateApiKey } from '../utils/apiKeyManager';
import { getClientIp, getUserAgent } from '../utils/securityLogger';

/**
 * API Key Authentication Middleware
 */
export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      success: false,
      message: 'API key required',
    });
    return;
  }

  const validation = await validateApiKey(apiKey);

  if (!validation.valid || !validation.apiKey) {
    res.status(401).json({
      success: false,
      message: validation.error || 'Invalid API key',
    });
    return;
  }

  // Attach API key info to request
  (req as any).apiKey = validation.apiKey;
  (req as any).userId = validation.apiKey.userId;
  
  // Optional: Set user for compatibility
  if (!req.user) {
    req.user = {
      id: validation.apiKey.userId,
      email: '', // API keys don't have email
      role: 'api',
    };
  }

  next();
};

/**
 * Check API key permission
 */
export const requireApiKeyPermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const apiKey = (req as any).apiKey;

    if (!apiKey) {
      res.status(403).json({
        success: false,
        message: 'API key required',
      });
      return;
    }

    if (apiKey.permissions.length > 0 && !apiKey.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        message: `Permission required: ${permission}`,
      });
      return;
    }

    next();
  };
};












