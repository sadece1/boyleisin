import pool from '../config/database';
import { Reservation, ReservationGear } from '../types';
import { generateId, getPaginationParams, formatPagination, calculateReservationPrice, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const getReservations = async (query: any, userId?: string) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (userId) {
    conditions.push('user_id = ?');
    values.push(userId);
  }

  if (query.status) {
    conditions.push('status = ?');
    values.push(query.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM reservations ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [reservations] = await pool.execute<Array<any>>(
    `SELECT * FROM reservations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  // Get gear for each reservation
  const reservationsWithGear = await Promise.all(
    reservations.map(async (r: any) => {
      const [gear] = await pool.execute<Array<any>>(
        'SELECT * FROM reservation_gear WHERE reservation_id = ?',
        [r.id]
      );
      return { ...r, gear };
    })
  );

  return {
    data: reservationsWithGear,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const getReservationById = async (id: string, userId?: string, isAdmin: boolean = false): Promise<any | null> => {
  const [reservations] = await pool.execute<Array<any>>(
    'SELECT * FROM reservations WHERE id = ?',
    [id]
  );

  if (isEmpty(reservations)) {
    return null;
  }

  const reservation = reservations[0];

  if (!isAdmin && reservation.user_id !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const [gear] = await pool.execute<Array<any>>(
    'SELECT * FROM reservation_gear WHERE reservation_id = ?',
    [id]
  );

  return { ...reservation, gear };
};

export const createReservation = async (
  data: { campsite_id?: string; gear_ids?: string[]; start_date: Date; end_date: Date },
  userId: string
): Promise<Reservation> => {
  // Calculate total price
  let totalPrice = 0;

  if (data.campsite_id) {
    const [campsites] = await pool.execute<Array<any>>(
      'SELECT price_per_night FROM campsites WHERE id = ?',
      [data.campsite_id]
    );
    if (isEmpty(campsites)) {
      throw new AppError('Campsite not found', 404);
    }
    totalPrice = calculateReservationPrice(
      campsites[0].price_per_night,
      new Date(data.start_date),
      new Date(data.end_date)
    );
  }

  if (data.gear_ids && data.gear_ids.length > 0) {
    const placeholders = data.gear_ids.map(() => '?').join(',');
    const [gear] = await pool.execute<Array<any>>(
      `SELECT price_per_day FROM gear WHERE id IN (${placeholders})`,
      data.gear_ids
    );
    const gearPrices = gear.map((g: any) => g.price_per_day);
    const gearTotal = calculateReservationPrice(
      0,
      new Date(data.start_date),
      new Date(data.end_date),
      gearPrices
    );
    totalPrice += gearTotal;
  }

  const id = generateId();

  await pool.execute(
    `INSERT INTO reservations (id, user_id, campsite_id, start_date, end_date, total_price, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [id, userId, data.campsite_id || null, data.start_date, data.end_date, totalPrice]
  );

  // Add gear if provided
  if (data.gear_ids && data.gear_ids.length > 0) {
    for (const gearId of data.gear_ids) {
      await pool.execute(
        'INSERT INTO reservation_gear (reservation_id, gear_id, quantity) VALUES (?, ?, ?)',
        [id, gearId, 1]
      );
    }
  }

  const reservation = await getReservationById(id, userId);
  if (!reservation) {
    throw new AppError('Failed to create reservation', 500);
  }

  logger.info(`Reservation created: ${id}`);
  return reservation as Reservation;
};

export const updateReservation = async (
  id: string,
  data: Partial<Reservation>,
  userId?: string,
  isAdmin: boolean = false
): Promise<Reservation> => {
  const existing = await getReservationById(id, userId, isAdmin);
  if (!existing) {
    throw new AppError('Reservation not found', 404);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.status) {
    updateFields.push('status = ?');
    updateValues.push(data.status);
  }
  if (data.start_date) {
    updateFields.push('start_date = ?');
    updateValues.push(data.start_date);
  }
  if (data.end_date) {
    updateFields.push('end_date = ?');
    updateValues.push(data.end_date);
  }

  if (updateFields.length === 0) {
    return existing as Reservation;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE reservations SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getReservationById(id, userId, isAdmin);
  if (!updated) {
    throw new AppError('Failed to update reservation', 500);
  }

  logger.info(`Reservation updated: ${id}`);
  return updated as Reservation;
};

export const deleteReservation = async (id: string, userId?: string, isAdmin: boolean = false): Promise<void> => {
  const reservation = await getReservationById(id, userId, isAdmin);
  if (!reservation) {
    throw new AppError('Reservation not found', 404);
  }

  await pool.execute('DELETE FROM reservations WHERE id = ?', [id]);
  logger.info(`Reservation deleted: ${id}`);
};

export const checkAvailability = async (
  campsiteId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  const [conflicts] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as count FROM reservations 
     WHERE campsite_id = ? 
     AND status IN ('pending', 'confirmed')
     AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))`,
    [campsiteId, startDate, startDate, endDate, endDate]
  );

  return conflicts[0].count === 0;
};













