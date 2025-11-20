import pool from '../config/database';
import { Appointment } from '../types';
import { generateId, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const createAppointment = async (data: Omit<Appointment, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO appointments (id, name, email, phone, date, time, service_type, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, data.name, data.email, data.phone, data.date, data.time, data.service_type || null, data.message || null]
  );

  const [appointments] = await pool.execute<Array<any>>(
    'SELECT * FROM appointments WHERE id = ?',
    [id]
  );

  logger.info(`Appointment created: ${id}`);
  return appointments[0];
};

export const getAppointments = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (query.status) {
    conditions.push('status = ?');
    values.push(query.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM appointments ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [appointments] = await pool.execute<Array<any>>(
    `SELECT * FROM appointments ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: appointments,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  const [appointments] = await pool.execute<Array<any>>(
    'SELECT * FROM appointments WHERE id = ?',
    [id]
  );

  if (isEmpty(appointments)) {
    return null;
  }

  return appointments[0];
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
  const existing = await getAppointmentById(id);
  if (!existing) {
    throw new AppError('Appointment not found', 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.status) {
    updateFields.push('status = ?');
    updateValues.push(data.status);
  }
  if (data.name) {
    updateFields.push('name = ?');
    updateValues.push(data.name);
  }
  if (data.email) {
    updateFields.push('email = ?');
    updateValues.push(data.email);
  }
  if (data.phone) {
    updateFields.push('phone = ?');
    updateValues.push(data.phone);
  }
  if (data.date) {
    updateFields.push('date = ?');
    updateValues.push(data.date);
  }
  if (data.time) {
    updateFields.push('time = ?');
    updateValues.push(data.time);
  }
  if (data.service_type !== undefined) {
    updateFields.push('service_type = ?');
    updateValues.push(data.service_type);
  }
  if (data.message !== undefined) {
    updateFields.push('message = ?');
    updateValues.push(data.message);
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE appointments SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getAppointmentById(id);
  if (!updated) {
    throw new AppError('Failed to update appointment', 500);
  }

  logger.info(`Appointment updated: ${id}`);
  return updated;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
  logger.info(`Appointment deleted: ${id}`);
};













