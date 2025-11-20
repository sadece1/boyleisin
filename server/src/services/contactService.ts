import pool from '../config/database';
import { ContactMessage } from '../types';
import { generateId, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const createContactMessage = async (data: Omit<ContactMessage, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<ContactMessage> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO contact_messages (id, name, email, subject, message)
     VALUES (?, ?, ?, ?, ?)`,
    [id, data.name, data.email, data.subject, data.message]
  );

  const [messages] = await pool.execute<Array<any>>(
    'SELECT * FROM contact_messages WHERE id = ?',
    [id]
  );

  logger.info(`Contact message created: ${id}`);
  return messages[0];
};

export const getContactMessages = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (query.read !== undefined) {
    conditions.push('`read` = ?');
    values.push(query.read);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM contact_messages ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [messages] = await pool.execute<Array<any>>(
    `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: messages,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const markAsRead = async (id: string): Promise<void> => {
  await pool.execute('UPDATE contact_messages SET `read` = TRUE WHERE id = ?', [id]);
  logger.info(`Contact message marked as read: ${id}`);
};

export const deleteContactMessage = async (id: string): Promise<void> => {
  const [messages] = await pool.execute<Array<any>>(
    'SELECT * FROM contact_messages WHERE id = ?',
    [id]
  );

  if (isEmpty(messages)) {
    throw new AppError('Contact message not found', 404);
  }

  await pool.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
  logger.info(`Contact message deleted: ${id}`);
};













