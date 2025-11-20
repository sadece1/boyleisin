import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { authorizeAdmin } from '../middleware/auth';
import {
  getQuarantinedFiles,
  getUploadedFileById,
} from '../services/uploadService';
import {
  releaseFromQuarantine,
  deleteQuarantinedFile,
} from '../utils/quarantineManager';
import { uploadConfig } from '../config/upload';
import path from 'path';

/**
 * Get quarantined files (Admin only)
 */
export const getQuarantined = [
  authorizeAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { files, total } = await getQuarantinedFiles(limit, offset);

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
  }),
];

/**
 * Release file from quarantine (Admin only)
 */
export const releaseFile = [
  authorizeAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params;

    const file = await getUploadedFileById(fileId);
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    if (!file.isQuarantined) {
      res.status(400).json({
        success: false,
        message: 'File is not quarantined',
      });
      return;
    }

    const uploadedPath = path.join(
      process.cwd(),
      uploadConfig.uploadDir,
      file.filename
    );

    const released = await releaseFromQuarantine(fileId, uploadedPath);

    if (released) {
      res.status(200).json({
        success: true,
        message: 'File released from quarantine successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to release file from quarantine',
      });
    }
  }),
];

/**
 * Delete quarantined file permanently (Admin only)
 */
export const deleteQuarantined = [
  authorizeAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { fileId } = req.params;

    const file = await getUploadedFileById(fileId);
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    const deleted = await deleteQuarantinedFile(fileId);

    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Quarantined file deleted permanently',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete quarantined file',
      });
    }
  }),
];












