import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { deleteFile } from '../middleware/upload';
import { asyncHandler } from '../middleware/errorHandler';
import { getUserUploadedFiles, deleteUploadRecord, getUserUploadQuota } from '../services/uploadService';
import path from 'path';
import logger from '../utils/logger';

/**
 * Handler for single image upload
 * Multer middleware already processed the file, this just returns the response
 */
export const uploadImageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
    return;
  }

  logger.info(`File uploaded: ${req.file.filename}`);

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
    },
  });
});

/**
 * Handler for multiple images upload
 * Multer middleware already processed the files, this just returns the response
 */
export const uploadImagesHandler = asyncHandler(async (req: Request, res: Response) => {
  try {
    logger.info('Upload images handler called', {
      hasFiles: !!req.files,
      filesCount: req.files ? (Array.isArray(req.files) ? req.files.length : 1) : 0,
    });

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      logger.warn('No files in request');
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
    }));

    logger.info(`Files uploaded successfully: ${files.length} files`);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedFiles,
    });
  } catch (error) {
    logger.error('Error in uploadImagesHandler:', error);
    throw error; // Let asyncHandler catch it
  }
});

export const removeFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { filename } = req.params;

  // Delete physical file
  deleteFile(filename);

  // Delete database record if exists
  // Note: In a real implementation, you'd look up the file ID by filename
  // For now, we just delete the physical file

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
  });
});

/**
 * Get user's uploaded files
 */
export const getUserFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { files, total } = await getUserUploadedFiles(req.user.id, limit, offset);

  res.status(200).json({
    success: true,
    data: {
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * Get user's upload quota
 */
export const getUploadQuota = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const totalSize = await getUserUploadQuota(req.user.id);
  const maxQuota = parseInt(process.env.MAX_USER_UPLOAD_QUOTA || '1073741824', 10); // 1GB default

  res.status(200).json({
    success: true,
    data: {
      used: totalSize,
      max: maxQuota,
      available: Math.max(0, maxQuota - totalSize),
      percentage: ((totalSize / maxQuota) * 100).toFixed(2),
    },
  });
});


