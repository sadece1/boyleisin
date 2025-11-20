import { Router } from 'express';
import {
  uploadImageHandler,
  uploadImagesHandler,
  removeFile,
  getUserFiles,
  getUploadQuota,
} from '../controllers/uploadController';
import {
  getQuarantined,
  releaseFile,
  deleteQuarantined,
} from '../controllers/quarantineController';
import { authenticate } from '../middleware/auth';
import { validateUploadedFile } from '../middleware/fileValidation';
import {
  checkUploadRateLimit,
  checkDiskSpaceBeforeUpload,
  setSecureFilePermissions,
} from '../middleware/uploadSecurity';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

const router = Router();

router.post(
  '/image',
  authenticate,
  checkUploadRateLimit,
  checkDiskSpaceBeforeUpload,
  (req, res, next) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        // Multer error handling
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.',
          });
        }
        if (err.message) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
        });
      }
      next();
    });
  },
  validateUploadedFile,
  (req, res, next) => {
    // Set secure permissions after upload
    if (req.file) {
      const filePath = require('path').join(
        process.cwd(),
        process.env.UPLOAD_DIR || './uploads',
        req.file.filename
      );
      setSecureFilePermissions(filePath);
    }
    next();
  },
  uploadImageHandler
);

router.post(
  '/images',
  (req, res, next) => {
    // Log request for debugging
    console.log('Upload request received:', {
      hasAuth: !!req.headers.authorization,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
    });
    next();
  },
  authenticate,
  checkUploadRateLimit,
  checkDiskSpaceBeforeUpload,
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        // Multer error handling
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum is 10 files.',
          });
        }
        if (err.message) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: 'File upload failed: ' + (err as Error).message,
        });
      }
      console.log('Files uploaded:', req.files ? (Array.isArray(req.files) ? req.files.length : 1) : 0);
      next();
    });
  },
  // Validate files (with error handling)
  async (req, res, next) => {
    try {
      await validateUploadedFile(req, res, next);
    } catch (error) {
      console.error('Validation error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'File validation error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        });
      }
    }
  },
  (req, res, next) => {
    // Set secure permissions after upload
    try {
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : [req.files];
        files.forEach((file) => {
          const filePath = require('path').join(
            process.cwd(),
            process.env.UPLOAD_DIR || './uploads',
            file.filename
          );
          setSecureFilePermissions(filePath);
        });
      }
    } catch (error) {
      console.error('Error setting file permissions:', error);
      // Continue anyway
    }
    next();
  },
  uploadImagesHandler
);

router.delete('/:filename', authenticate, removeFile);
router.get('/user/files', authenticate, getUserFiles);
router.get('/user/quota', authenticate, getUploadQuota);

// Quarantine management (Admin only)
router.get('/quarantine', getQuarantined);
router.post('/quarantine/:fileId/release', releaseFile);
router.delete('/quarantine/:fileId', deleteQuarantined);

export default router;


