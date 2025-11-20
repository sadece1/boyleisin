import fs from 'fs';
import path from 'path';
import logger from './logger';
import { uploadConfig } from '../config/upload';
import {
  quarantineFile,
  releaseFileFromQuarantine,
  getQuarantinedFiles,
} from '../services/uploadService';

/**
 * Quarantine Manager - Manages file quarantine system
 */

const QUARANTINE_DIR = path.join(
  process.cwd(),
  uploadConfig.uploadDir,
  'quarantine'
);

/**
 * Initialize quarantine directory
 */
export const initializeQuarantine = (): void => {
  if (!fs.existsSync(QUARANTINE_DIR)) {
    fs.mkdirSync(QUARANTINE_DIR, { recursive: true, mode: 0o700 });
    logger.info(`Quarantine directory created: ${QUARANTINE_DIR}`);
  }
};

// Initialize on module load
initializeQuarantine();

/**
 * Move file to quarantine
 */
export const moveToQuarantine = async (
  fileId: string,
  filePath: string,
  reason: string
): Promise<boolean> => {
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found for quarantine: ${filePath}`);
      return false;
    }

    const filename = path.basename(filePath);
    const quarantinePath = path.join(QUARANTINE_DIR, `${fileId}-${filename}`);

    // Move file to quarantine
    fs.renameSync(filePath, quarantinePath);

    // Set restrictive permissions
    fs.chmodSync(quarantinePath, 0o600); // Only owner can read/write

    // Update database record
    await quarantineFile(fileId, reason);

    logger.warn(`File moved to quarantine: ${filename} - Reason: ${reason}`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to move file to quarantine: ${error}`);
    return false;
  }
};

/**
 * Release file from quarantine
 */
export const releaseFromQuarantine = async (
  fileId: string,
  uploadedFilePath: string
): Promise<boolean> => {
  try {
    // Find quarantine file
    const quarantineFiles = fs.readdirSync(QUARANTINE_DIR);
    const quarantineFile = quarantineFiles.find(f => f.startsWith(fileId));

    if (!quarantineFile) {
      logger.warn(`Quarantine file not found: ${fileId}`);
      return false;
    }

    const quarantinePath = path.join(QUARANTINE_DIR, quarantineFile);
    
    // Ensure upload directory exists
    const uploadDir = path.dirname(uploadedFilePath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file back to upload directory
    fs.renameSync(quarantinePath, uploadedFilePath);

    // Set normal permissions
    fs.chmodSync(uploadedFilePath, 0o644);

    // Update database record
    await releaseFileFromQuarantine(fileId);

    logger.info(`File released from quarantine: ${path.basename(uploadedFilePath)}`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to release file from quarantine: ${error}`);
    return false;
  }
};

/**
 * Delete quarantined file permanently
 */
export const deleteQuarantinedFile = async (fileId: string): Promise<boolean> => {
  try {
    const quarantineFiles = fs.readdirSync(QUARANTINE_DIR);
    const quarantineFile = quarantineFiles.find(f => f.startsWith(fileId));

    if (!quarantineFile) {
      return false;
    }

    const quarantinePath = path.join(QUARANTINE_DIR, quarantineFile);
    fs.unlinkSync(quarantinePath);

    logger.info(`Quarantined file deleted permanently: ${fileId}`);
    
    return true;
  } catch (error) {
    logger.error(`Failed to delete quarantined file: ${error}`);
    return false;
  }
};

/**
 * Cleanup old quarantined files (older than specified days)
 */
export const cleanupOldQuarantinedFiles = async (daysOld: number = 30): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const quarantinedData = await getQuarantinedFiles(1000, 0);
    let deletedCount = 0;

    for (const file of quarantinedData.files) {
      if (file.uploadedAt < cutoffDate) {
        const deleted = await deleteQuarantinedFile(file.id);
        if (deleted) {
          deletedCount++;
        }
      }
    }

    logger.info(`Cleaned up ${deletedCount} old quarantined files`);
    return deletedCount;
  } catch (error) {
    logger.error(`Failed to cleanup quarantined files: ${error}`);
    return 0;
  }
};

// Run cleanup every 7 days
setInterval(() => {
  cleanupOldQuarantinedFiles(30).catch(console.error);
}, 7 * 24 * 60 * 60 * 1000);












