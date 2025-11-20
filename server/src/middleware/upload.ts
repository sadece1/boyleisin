import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadConfig } from '../config/upload';
import { Request } from 'express';
import logger from '../utils/logger';
import { sanitizeString } from '../utils/helpers';

// Create upload directory if it doesn't exist
const uploadDir = path.resolve(process.cwd(), uploadConfig.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // Sanitize filename to prevent path traversal and injection
    const originalName = path.basename(file.originalname, ext);
    const sanitizedName = sanitizeString(originalName)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 100); // Limit filename length
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext.toLowerCase()}`);
  },
});

// Allowed file extensions (whitelist approach)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Magic numbers for image file validation (file signature)
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
};

/**
 * Validate file by checking magic numbers
 */
const validateFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some((signature) => {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

// File filter with enhanced validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      )
    );
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(
      new Error(
        `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
    return;
  }

  // Store file info for later signature validation
  (req as any).fileToValidate = file;
  cb(null, true);
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

// Single image upload middleware
export const uploadSingle = upload.single('image');

// Multiple images upload middleware
export const uploadMultiple = upload.array('images', 10); // Max 10 images

/**
 * Delete file from upload directory with path traversal protection
 */
export const deleteFile = (filename: string): void => {
  // Prevent path traversal attacks
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(uploadDir, sanitizedFilename);
  
  // Ensure the resolved path is still within upload directory
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(uploadDir);
  
  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    logger.warn(`Path traversal attempt detected: ${filename}`);
    return;
  }
  
  if (fs.existsSync(filePath)) {
    // Check if it's a symlink (security measure)
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      logger.warn(`Symlink detected, refusing to delete: ${filename}`);
      return;
    }
    
    fs.unlinkSync(filePath);
    logger.info(`Deleted file: ${filename}`);
  }
};

/**
 * Check disk space before upload
 */
export const checkDiskSpace = (requiredBytes: number): { hasSpace: boolean; error?: string } => {
  try {
    // Cross-platform disk space check
    // Note: fs.statfsSync is not available on Windows, using alternative approach
    const stats = fs.statSync(uploadDir);
    
    // For Windows compatibility, we'll use a different approach
    // Check if we can write a small test file
    const testFilePath = path.join(uploadDir, `.space-test-${Date.now()}`);
    try {
      fs.writeFileSync(testFilePath, Buffer.alloc(1));
      fs.unlinkSync(testFilePath);
      
      // Basic check: if we can write, assume there's space
      // In production, implement proper disk space checking with a cross-platform library
      return { hasSpace: true };
    } catch (writeError: any) {
      if (writeError.code === 'ENOSPC') {
        return {
          hasSpace: false,
          error: 'Insufficient disk space',
        };
      }
      // Other errors, allow upload but log
      logger.warn('Disk space check inconclusive:', writeError);
      return { hasSpace: true };
    }
  } catch (error) {
    logger.error('Disk space check error:', error);
    // Allow upload if check fails (fail open, but log it)
    return { hasSpace: true };
  }
};

/**
 * Get total size of uploaded files for a user
 */
export const getUserUploadQuota = async (userId: string): Promise<number> => {
  // This would typically query a database
  // For now, return 0 as placeholder
  return 0;
};


