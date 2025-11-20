import dotenv from 'dotenv';

dotenv.config();

export const uploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};













