import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '../config/upload';
import logger from '../utils/logger';
import {
  validateImage,
  sanitizeImage,
  detectPolyglotFile,
  generateFileHash,
} from '../utils/imageValidator';
import { securityLogger, SecurityEventType } from '../utils/securityLogger';
import { scanFile } from '../utils/virusScanner';
import { updateVirusScanStatus } from '../services/uploadService';
import { moveToQuarantine } from '../utils/quarantineManager';
import { createUploadRecord, getUploadedFileByHash } from '../services/uploadService';

/**
 * Validate uploaded file content (magic number check)
 * This should be called after file upload
 */
export const validateUploadedFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const files = req.file
    ? [req.file]
    : req.files
    ? Array.isArray(req.files)
      ? req.files
      : [req.files]
    : [];

  if (files.length === 0) {
    next();
    return;
  }

  // In development mode, skip complex validation for faster uploads
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    for (const file of files) {
      const filePath = path.join(process.cwd(), uploadConfig.uploadDir, file.filename);

      if (!fs.existsSync(filePath)) {
        logger.warn(`Uploaded file not found: ${filePath}`);
        res.status(400).json({
          success: false,
          error: 'Uploaded file not found',
        });
        return;
      }

      // 1. Basic magic number validation (always do this)
      const buffer = Buffer.allocUnsafe(12);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 12, 0);
      fs.closeSync(fd);

      const ext = path.extname(file.filename).toLowerCase();
      let isValid = false;

      switch (ext) {
        case '.jpg':
        case '.jpeg':
          isValid = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
          break;
        case '.png':
          isValid = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
          break;
        case '.webp':
          isValid = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
          break;
        case '.gif':
          isValid = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
          break;
      }

      if (!isValid) {
        fs.unlinkSync(filePath);
        logger.warn(`Invalid file signature detected: ${file.filename}`);
        securityLogger.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          userId: (req as any).user?.id,
          ip: (req as any).ip,
          details: {
            activity: 'Invalid file signature',
            filename: file.filename,
          },
          severity: 'high',
        });
        res.status(400).json({
          success: false,
          error: 'Invalid file content. File signature validation failed.',
        });
        return;
      }

      // 2. Polyglot file detection (skip in development)
      if (!isDevelopment) {
        let polyglotCheck;
        try {
          polyglotCheck = await detectPolyglotFile(filePath);
        } catch (polyglotError) {
          logger.warn('Polyglot detection failed, skipping:', polyglotError);
          polyglotCheck = { isPolyglot: false };
        }
        
        if (polyglotCheck.isPolyglot) {
          fs.unlinkSync(filePath);
          logger.warn(`Polyglot file detected: ${file.filename}`, polyglotCheck.detectedTypes);
          securityLogger.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
            userId: (req as any).user?.id,
            ip: (req as any).ip,
            details: {
              activity: 'Polyglot file upload attempt',
              filename: file.filename,
              detectedTypes: polyglotCheck.detectedTypes,
            },
            severity: 'critical',
          });
          res.status(400).json({
            success: false,
            error: 'Polyglot file detected. File contains multiple file types.',
          });
          return;
        }
      }

      // 3. Image dimension and content validation (basic check only in development)
      if (!isDevelopment) {
        let imageValidation;
        try {
          imageValidation = await validateImage(filePath);
        } catch (validationError) {
          logger.error('Image validation error:', validationError);
          res.status(400).json({
            success: false,
            error: 'Image validation failed: ' + (validationError as Error).message,
          });
          return;
        }
        
        if (!imageValidation.valid) {
          fs.unlinkSync(filePath);
          logger.warn(`Image validation failed: ${file.filename}`, imageValidation.error);
          res.status(400).json({
            success: false,
            error: imageValidation.error || 'Image validation failed',
          });
          return;
        }
      } else {
        // In development, just check if file exists and is readable
        try {
          fs.accessSync(filePath, fs.constants.R_OK);
        } catch (accessError) {
          logger.error('File access error:', accessError);
          res.status(400).json({
            success: false,
            error: 'File is not accessible',
          });
          return;
        }
      }

      // 4. Sanitize image (re-encode and strip metadata) - skip in development
      if (!isDevelopment) {
        let sanitizeResult;
        try {
          const sanitizedPath = filePath.replace(/\.[^.]+$/, '_sanitized.jpg');
          sanitizeResult = await sanitizeImage(
            filePath,
            sanitizedPath,
            'jpeg',
            85
          );

          if (sanitizeResult.success) {
            // Replace original with sanitized version
            fs.unlinkSync(filePath);
            fs.renameSync(sanitizedPath, filePath);
            
            // Update filename if extension changed
            if (!file.filename.endsWith('.jpg')) {
              const newFilename = file.filename.replace(/\.[^.]+$/, '.jpg');
              const newPath = path.join(process.cwd(), uploadConfig.uploadDir, newFilename);
              fs.renameSync(filePath, newPath);
              file.filename = newFilename;
              file.path = newPath;
            }

            logger.info(`Image sanitized: ${file.filename}`);
          }
        } catch (sanitizeError) {
          logger.warn(`Image sanitization failed: ${file.filename}`, sanitizeError);
          // Continue with original file
        }
      }

      // 5. Generate file hash for duplicate detection
      let fileHash;
      try {
        fileHash = await generateFileHash(filePath);
      } catch (hashError) {
        logger.warn('File hash generation failed:', hashError);
        fileHash = `hash-${Date.now()}-${Math.random()}`; // Fallback hash
      }
      // Store hash for later use
      (file as any).hash = fileHash;

      // 6. Check for duplicate files (skip if database error)
      try {
        const duplicateFile = await getUploadedFileByHash(fileHash);
        if (duplicateFile && !duplicateFile.isQuarantined) {
          logger.info(`Duplicate file detected: ${file.filename} (matches ${duplicateFile.filename})`);
          // Optionally delete the duplicate file to save space
          // For now, we'll keep it but could add duplicate detection logic
        }
      } catch (duplicateError) {
        logger.warn('Duplicate file check failed:', duplicateError);
        // Continue with upload
      }

      // 7. Virus scanning (if enabled, skip in development)
      const userId = (req as any).user?.id;
      if (!isDevelopment && process.env.ENABLE_VIRUS_SCAN === 'true' && process.env.ENABLE_VIRUS_SCAN !== 'false') {
        try {
          const virusScanResult = await scanFile(filePath);
          
          if (virusScanResult.infected) {
            // Move to quarantine
            const fileRecord = await createUploadRecord(
              userId || 'system',
              file.filename,
              file.originalname,
              fileHash,
              file.size,
              file.mimetype,
              filePath
            );
            
            await moveToQuarantine(
              fileRecord.id,
              filePath,
              `Virus detected: ${virusScanResult.threatName || 'Unknown'}`
            );

            securityLogger.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
              userId,
              ip: (req as any).ip,
              details: {
                activity: 'Virus detected in uploaded file',
                filename: file.filename,
                threatName: virusScanResult.threatName,
              },
              severity: 'critical',
            });

            res.status(400).json({
              success: false,
              error: 'File contains malicious content and has been quarantined',
            });
            return;
          }

          // Update scan status if file record exists
          const existingFile = await getUploadedFileByHash(fileHash);
          if (existingFile) {
            await updateVirusScanStatus(
              existingFile.id,
              virusScanResult.clean ? 'clean' : 'error'
            );
          }
        } catch (virusScanError) {
          // Log but don't fail upload if virus scan fails
          logger.warn('Virus scan failed, continuing with upload:', virusScanError);
        }
      }

      // 8. Create file record in database (for ownership tracking) - optional
      if (userId) {
        try {
          await createUploadRecord(
            userId,
            file.filename,
            file.originalname,
            fileHash,
            file.size,
            file.mimetype,
            filePath
          );
        } catch (error) {
          // Log but don't fail the upload if record creation fails (database might not be set up)
          logger.warn('Failed to create upload record (continuing anyway):', error);
        }
      }
    }

    next();
  } catch (error) {
    logger.error('File validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    logger.error('Error details:', { errorMessage, errorStack });
    res.status(500).json({
      success: false,
      error: 'File validation failed: ' + errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    });
  }
};

