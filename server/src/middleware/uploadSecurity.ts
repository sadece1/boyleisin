import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '../config/upload';
import { checkDiskSpace } from './upload';
import { securityLogger, SecurityEventType, getClientIp } from '../utils/securityLogger';
import logger from '../utils/logger';

/**
 * Upload Security Middleware
 * Additional security checks before file upload
 */

// Track uploads per user/IP to prevent abuse
const uploadCounts = new Map<string, { count: number; resetAt: Date }>();
const UPLOAD_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_UPLOADS_PER_WINDOW = parseInt(process.env.MAX_UPLOADS_PER_HOUR || '50', 10);

/**
 * Cleanup old upload counts
 */
setInterval(() => {
  const now = new Date();
  uploadCounts.forEach((value, key) => {
    if (now > value.resetAt) {
      uploadCounts.delete(key);
    }
  });
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Check upload rate limit per user/IP
 */
export const checkUploadRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = (req as any).user?.id || 'anonymous';
  const ip = getClientIp(req);
  const key = `${userId}:${ip}`;

  const now = new Date();
  const count = uploadCounts.get(key);

  if (count && now < count.resetAt) {
    if (count.count >= MAX_UPLOADS_PER_WINDOW) {
      securityLogger.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
        userId: (req as any).user?.id,
        ip,
        details: {
          activity: 'Upload rate limit exceeded',
          count: count.count,
          limit: MAX_UPLOADS_PER_WINDOW,
        },
        severity: 'high',
      });

      res.status(429).json({
        success: false,
        error: `Upload limit exceeded. Maximum ${MAX_UPLOADS_PER_WINDOW} uploads per hour.`,
      });
      return;
    }

    count.count++;
  } else {
    uploadCounts.set(key, {
      count: 1,
      resetAt: new Date(now.getTime() + UPLOAD_WINDOW),
    });
  }

  next();
};

/**
 * Check disk space before upload
 */
export const checkDiskSpaceBeforeUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Estimate required space (could be improved with actual file size from multer)
  const estimatedSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
  
  const spaceCheck = checkDiskSpace(estimatedSize);
  
  if (!spaceCheck.hasSpace) {
    logger.warn('Insufficient disk space for upload');
    res.status(507).json({
      success: false,
      error: 'Insufficient disk space. Please contact administrator.',
    });
    return;
  }

  next();
};

/**
 * Validate upload directory security
 */
export const validateUploadDirectory = (): void => {
  const uploadDir = path.resolve(process.cwd(), uploadConfig.uploadDir);

  // Check if directory exists and is writable
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  }

  // Check directory permissions
  try {
    const stats = fs.statSync(uploadDir);
    if (!stats.isDirectory()) {
      throw new Error('Upload path is not a directory');
    }
  } catch (error) {
    logger.error('Upload directory validation failed:', error);
    throw error;
  }

  // Check for symlinks (security risk) - only on Unix systems
  try {
    const realPath = fs.realpathSync(uploadDir);
    if (realPath !== uploadDir) {
      logger.warn('Upload directory is a symlink. This may pose security risks.');
    }
  } catch (error) {
    // May fail on some systems, ignore
  }
};

// Validate on module load
validateUploadDirectory();

/**
 * Set secure file permissions after upload
 */
export const setSecureFilePermissions = (filePath: string): void => {
  try {
    // Set permissions: owner read/write, group read, others read (644)
    fs.chmodSync(filePath, 0o644);
  } catch (error) {
    logger.warn(`Failed to set file permissions for ${filePath}:`, error);
  }
};

/**
 * Prevent symlink creation in upload directory
 */
export const preventSymlinkAttack = (filePath: string): boolean => {
  try {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      logger.warn(`Symlink detected: ${filePath}`);
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

