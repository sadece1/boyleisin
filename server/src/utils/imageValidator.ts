import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import logger from './logger';

/**
 * Image Validator - Validates image dimensions, content, and strips metadata
 */

const MAX_IMAGE_WIDTH = parseInt(process.env.MAX_IMAGE_WIDTH || '8192', 10); // 8K default
const MAX_IMAGE_HEIGHT = parseInt(process.env.MAX_IMAGE_HEIGHT || '8192', 10);
const MIN_IMAGE_WIDTH = 1;
const MIN_IMAGE_HEIGHT = 1;
const MAX_PIXELS = parseInt(process.env.MAX_IMAGE_PIXELS || '67108864', 10); // ~8192x8192

/**
 * Validate and process image
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

/**
 * Validate image dimensions and content
 */
export const validateImage = async (
  filePath: string
): Promise<ImageValidationResult> => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        error: 'File not found',
      };
    }

    // Get image metadata using sharp
    const metadata = await sharp(filePath).metadata();

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Invalid image: Cannot read dimensions',
      };
    }

    // Check dimensions
    if (
      metadata.width < MIN_IMAGE_WIDTH ||
      metadata.height < MIN_IMAGE_HEIGHT
    ) {
      return {
        valid: false,
        error: `Image dimensions too small. Minimum: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}`,
      };
    }

    if (metadata.width > MAX_IMAGE_WIDTH || metadata.height > MAX_IMAGE_HEIGHT) {
      return {
        valid: false,
        error: `Image dimensions too large. Maximum: ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT}`,
      };
    }

    // Check total pixels (prevent image bombs)
    const totalPixels = metadata.width * metadata.height;
    if (totalPixels > MAX_PIXELS) {
      return {
        valid: false,
        error: `Image too large. Maximum pixels: ${MAX_PIXELS.toLocaleString()}`,
      };
    }

    // Validate format
    const allowedFormats = ['jpeg', 'png', 'webp', 'gif'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid image format: ${metadata.format}`,
      };
    }

    // Check file size (additional check)
    const stats = fs.statSync(filePath);
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
      },
    };
  } catch (error: any) {
    logger.error('Image validation error:', error);
    return {
      valid: false,
      error: error.message || 'Image validation failed',
    };
  }
};

/**
 * Re-encode image to sanitize content and strip EXIF data
 */
export const sanitizeImage = async (
  inputPath: string,
  outputPath: string,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg',
  quality: number = 85
): Promise<{ success: boolean; error?: string }> => {
  try {
    await sharp(inputPath)
      .strip() // Remove EXIF and all metadata
      .toFormat(format, {
        quality,
        progressive: format === 'jpeg',
      })
      .toFile(outputPath);

    return { success: true };
  } catch (error: any) {
    logger.error('Image sanitization error:', error);
    return {
      success: false,
      error: error.message || 'Image sanitization failed',
    };
  }
};

/**
 * Check if image is a polyglot file (contains multiple file types)
 */
export const detectPolyglotFile = async (
  filePath: string
): Promise<{ isPolyglot: boolean; detectedTypes: string[] }> => {
  const detectedTypes: string[] = [];
  
  try {
    // Check magic numbers for common file types
    const buffer = Buffer.allocUnsafe(100);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 100, 0);
    fs.closeSync(fd);

    // Check for image signatures
    if (buffer[0] === 0xff && buffer[1] === 0xd8) detectedTypes.push('jpeg');
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e) detectedTypes.push('png');
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) detectedTypes.push('gif');
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) detectedTypes.push('webp');
    
    // Check for executable signatures
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) detectedTypes.push('exe/dll'); // PE
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) detectedTypes.push('elf');
    if (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe) detectedTypes.push('mach-o');
    
    // Check for script signatures
    if (buffer.toString('utf8', 0, 5) === '<?php') detectedTypes.push('php');
    if (buffer.toString('utf8', 0, 2) === '#!') detectedTypes.push('script');
    if (buffer.toString('utf8', 0, 3) === '<!-') detectedTypes.push('html');

    const isPolyglot = detectedTypes.length > 1;

    return { isPolyglot, detectedTypes };
  } catch (error) {
    logger.error('Polyglot detection error:', error);
    return { isPolyglot: false, detectedTypes: [] };
  }
};

/**
 * Generate file hash for duplicate detection
 */
export const generateFileHash = async (filePath: string): Promise<string> => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

