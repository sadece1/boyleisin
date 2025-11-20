import pool from '../config/database';
import { Review } from '../types';
import { generateId, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export const getReviews = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  if (query.campsite_id) {
    conditions.push('campsite_id = ?');
    values.push(query.campsite_id);
  }

  if (query.gear_id) {
    conditions.push('gear_id = ?');
    values.push(query.gear_id);
  }

  if (query.rating) {
    conditions.push('rating = ?');
    values.push(query.rating);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM reviews ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  const [reviews] = await pool.execute<Array<any>>(
    `SELECT r.*, u.name as user_name, u.avatar as user_avatar 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     ${whereClause} 
     ORDER BY r.created_at DESC 
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: reviews,
    pagination: formatPagination({ page, limit, total }),
  };
};

export const getReviewById = async (id: string): Promise<Review | null> => {
  const [reviews] = await pool.execute<Array<any>>(
    `SELECT r.*, u.name as user_name, u.avatar as user_avatar 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.id = ?`,
    [id]
  );

  if (isEmpty(reviews)) {
    return null;
  }

  return reviews[0];
};

export const createReview = async (
  data: { campsite_id?: string; gear_id?: string; rating: number; comment: string },
  userId: string
): Promise<Review> => {
  // Check if user already reviewed
  if (data.campsite_id) {
    const [existing] = await pool.execute<Array<any>>(
      'SELECT id FROM reviews WHERE user_id = ? AND campsite_id = ?',
      [userId, data.campsite_id]
    );
    if (existing.length > 0) {
      throw new AppError('You have already reviewed this campsite', 409);
    }
  }

  if (data.gear_id) {
    const [existing] = await pool.execute<Array<any>>(
      'SELECT id FROM reviews WHERE user_id = ? AND gear_id = ?',
      [userId, data.gear_id]
    );
    if (existing.length > 0) {
      throw new AppError('You have already reviewed this gear', 409);
    }
  }

  const id = generateId();

  await pool.execute(
    `INSERT INTO reviews (id, user_id, campsite_id, gear_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, data.campsite_id || null, data.gear_id || null, data.rating, data.comment]
  );

  // Update rating for campsite or gear
  if (data.campsite_id) {
    await updateCampsiteRating(data.campsite_id);
  }
  if (data.gear_id) {
    await updateGearRating(data.gear_id);
  }

  const review = await getReviewById(id);
  if (!review) {
    throw new AppError('Failed to create review', 500);
  }

  logger.info(`Review created: ${id}`);
  return review;
};

export const updateReview = async (
  id: string,
  data: Partial<Review>,
  userId: string,
  isAdmin: boolean = false
): Promise<Review> => {
  const [reviews] = await pool.execute<Array<any>>(
    'SELECT * FROM reviews WHERE id = ?',
    [id]
  );

  if (isEmpty(reviews)) {
    throw new AppError('Review not found', 404);
  }

  const review = reviews[0];

  if (!isAdmin && review.user_id !== userId) {
    throw new AppError('Unauthorized to update this review', 403);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.rating !== undefined) {
    updateFields.push('rating = ?');
    updateValues.push(data.rating);
  }
  if (data.comment) {
    updateFields.push('comment = ?');
    updateValues.push(data.comment);
  }

  if (updateFields.length === 0) {
    return await getReviewById(id) as Review;
  }

  updateValues.push(id);

  await pool.execute(
    `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Update rating
  if (review.campsite_id) {
    await updateCampsiteRating(review.campsite_id);
  }
  if (review.gear_id) {
    await updateGearRating(review.gear_id);
  }

  const updated = await getReviewById(id);
  if (!updated) {
    throw new AppError('Failed to update review', 500);
  }

  logger.info(`Review updated: ${id}`);
  return updated;
};

export const deleteReview = async (
  id: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> => {
  const [reviews] = await pool.execute<Array<any>>(
    'SELECT * FROM reviews WHERE id = ?',
    [id]
  );

  if (isEmpty(reviews)) {
    throw new AppError('Review not found', 404);
  }

  const review = reviews[0];

  if (!isAdmin && review.user_id !== userId) {
    throw new AppError('Unauthorized to delete this review', 403);
  }

  await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);

  // Update rating
  if (review.campsite_id) {
    await updateCampsiteRating(review.campsite_id);
  }
  if (review.gear_id) {
    await updateGearRating(review.gear_id);
  }

  logger.info(`Review deleted: ${id}`);
};

async function updateCampsiteRating(campsiteId: string): Promise<void> {
  const [stats] = await pool.execute<Array<any>>(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE campsite_id = ?',
    [campsiteId]
  );

  const avgRating = stats[0].avg_rating || 0;
  const reviewCount = stats[0].count || 0;

  await pool.execute(
    'UPDATE campsites SET rating = ?, review_count = ? WHERE id = ?',
    [avgRating, reviewCount, campsiteId]
  );
}

async function updateGearRating(gearId: string): Promise<void> {
  const [stats] = await pool.execute<Array<any>>(
    'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE gear_id = ?',
    [gearId]
  );

  const avgRating = stats[0].avg_rating || 0;
  const reviewCount = stats[0].count || 0;

  await pool.execute(
    'UPDATE gear SET rating = ? WHERE id = ?',
    [avgRating, gearId]
  );
}













