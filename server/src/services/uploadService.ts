import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import logger from '../utils/logger';

/**
 * Upload Service - Manages file uploads and ownership
 */

export interface UploadedFile {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  path: string;
  isQuarantined: boolean;
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';
  uploadedAt: Date;
}

/**
 * Create uploaded file record
 */
export const createUploadRecord = async (
  userId: string,
  filename: string,
  originalName: string,
  fileHash: string,
  fileSize: number,
  mimeType: string,
  path: string
): Promise<UploadedFile> => {
  const id = crypto.randomUUID();
  
  const query = `
    INSERT INTO uploaded_files 
    (id, user_id, filename, original_name, file_hash, file_size, mime_type, path, is_quarantined, virus_scan_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, 'pending')
  `;

  await pool.execute<ResultSetHeader>(query, [
    id,
    userId,
    filename,
    originalName,
    fileHash,
    fileSize,
    mimeType,
    path,
  ]);

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM uploaded_files WHERE id = ?',
    [id]
  );

  return mapRowToUploadedFile(rows[0]);
};

/**
 * Get uploaded file by ID
 */
export const getUploadedFileById = async (id: string): Promise<UploadedFile | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM uploaded_files WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToUploadedFile(rows[0]);
};

/**
 * Get uploaded file by hash (duplicate detection)
 */
export const getUploadedFileByHash = async (fileHash: string): Promise<UploadedFile | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM uploaded_files WHERE file_hash = ? AND is_quarantined = FALSE LIMIT 1',
    [fileHash]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapRowToUploadedFile(rows[0]);
};

/**
 * Get user's uploaded files
 */
export const getUserUploadedFiles = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ files: UploadedFile[]; total: number }> => {
  const [files] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM uploaded_files 
     WHERE user_id = ? 
     ORDER BY uploaded_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM uploaded_files WHERE user_id = ?',
    [userId]
  );

  return {
    files: files.map(mapRowToUploadedFile),
    total: countRows[0].total,
  };
};

/**
 * Get user's total upload size
 */
export const getUserUploadQuota = async (userId: string): Promise<number> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COALESCE(SUM(file_size), 0) as total_size 
     FROM uploaded_files 
     WHERE user_id = ? AND is_quarantined = FALSE`,
    [userId]
  );

  return rows[0].total_size || 0;
};

/**
 * Quarantine file
 */
export const quarantineFile = async (
  fileId: string,
  reason: string
): Promise<void> => {
  await pool.execute(
    `UPDATE uploaded_files 
     SET is_quarantined = TRUE, virus_scan_status = 'infected' 
     WHERE id = ?`,
    [fileId]
  );

  logger.warn(`File quarantined: ${fileId}, reason: ${reason}`);
};

/**
 * Release file from quarantine
 */
export const releaseFileFromQuarantine = async (fileId: string): Promise<void> => {
  await pool.execute(
    `UPDATE uploaded_files 
     SET is_quarantined = FALSE, virus_scan_status = 'clean' 
     WHERE id = ?`,
    [fileId]
  );

  logger.info(`File released from quarantine: ${fileId}`);
};

/**
 * Update virus scan status
 */
export const updateVirusScanStatus = async (
  fileId: string,
  status: 'pending' | 'clean' | 'infected' | 'error'
): Promise<void> => {
  await pool.execute(
    'UPDATE uploaded_files SET virus_scan_status = ? WHERE id = ?',
    [status, fileId]
  );
};

/**
 * Delete uploaded file record
 */
export const deleteUploadRecord = async (fileId: string, userId: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM uploaded_files WHERE id = ? AND user_id = ?',
    [fileId, userId]
  );

  return result.affectedRows > 0;
};

/**
 * Get quarantined files (admin only)
 */
export const getQuarantinedFiles = async (
  limit: number = 50,
  offset: number = 0
): Promise<{ files: UploadedFile[]; total: number }> => {
  const [files] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM uploaded_files 
     WHERE is_quarantined = TRUE 
     ORDER BY uploaded_at DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM uploaded_files WHERE is_quarantined = TRUE'
  );

  return {
    files: files.map(mapRowToUploadedFile),
    total: countRows[0].total,
  };
};

/**
 * Map database row to UploadedFile object
 */
const mapRowToUploadedFile = (row: any): UploadedFile => ({
  id: row.id,
  userId: row.user_id,
  filename: row.filename,
  originalName: row.original_name,
  fileHash: row.file_hash,
  fileSize: row.file_size,
  mimeType: row.mime_type,
  path: row.path,
  isQuarantined: row.is_quarantined === 1,
  virusScanStatus: row.virus_scan_status,
  uploadedAt: new Date(row.uploaded_at),
});

