import pool from '../config/database';
import { Favorite } from '../types';
import { generateId, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const getFavorites = async (userId: string) => {
  const [favorites] = await pool.execute<Array<any>>(
    `SELECT f.*, 
     (SELECT name FROM campsites WHERE id = f.campsite_id) as campsite_name,
     (SELECT name FROM gear WHERE id = f.gear_id) as gear_name
     FROM favorites f 
     WHERE f.user_id = ? 
     ORDER BY f.created_at DESC`,
    [userId]
  );

  return favorites;
};

export const addFavorite = async (
  data: { campsite_id?: string; gear_id?: string },
  userId: string
): Promise<Favorite> => {
  // Check if already favorited
  const [existing] = await pool.execute<Array<any>>(
    'SELECT id FROM favorites WHERE user_id = ? AND campsite_id = ? AND gear_id = ?',
    [userId, data.campsite_id || null, data.gear_id || null]
  );

  if (existing.length > 0) {
    throw new AppError('Item already in favorites', 409);
  }

  const id = generateId();

  await pool.execute(
    `INSERT INTO favorites (id, user_id, campsite_id, gear_id)
     VALUES (?, ?, ?, ?)`,
    [id, userId, data.campsite_id || null, data.gear_id || null]
  );

  const [favorites] = await pool.execute<Array<any>>(
    'SELECT * FROM favorites WHERE id = ?',
    [id]
  );

  logger.info(`Favorite added: ${id}`);
  return favorites[0];
};

export const removeFavorite = async (id: string, userId: string): Promise<void> => {
  const [favorites] = await pool.execute<Array<any>>(
    'SELECT * FROM favorites WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (isEmpty(favorites)) {
    throw new AppError('Favorite not found', 404);
  }

  await pool.execute('DELETE FROM favorites WHERE id = ?', [id]);
  logger.info(`Favorite removed: ${id}`);
};

export const checkFavorite = async (
  userId: string,
  campsiteId?: string,
  gearId?: string
): Promise<boolean> => {
  const [favorites] = await pool.execute<Array<any>>(
    'SELECT id FROM favorites WHERE user_id = ? AND campsite_id = ? AND gear_id = ?',
    [userId, campsiteId || null, gearId || null]
  );

  return favorites.length > 0;
};













