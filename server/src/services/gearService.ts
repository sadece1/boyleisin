import pool from '../config/database';
import { Gear } from '../types';
import { generateId, parseJson, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get all gear with filters and pagination
 */
export const getGear = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  // Search filter
  if (query.search) {
    conditions.push(`(name LIKE ? OR description LIKE ?)`);
    const searchTerm = `%${query.search}%`;
    values.push(searchTerm, searchTerm);
  }

  // Category filter
  if (query.category) {
    conditions.push('category_id = ?');
    values.push(query.category);
  }

  // Price filters
  if (query.minPrice) {
    conditions.push('price_per_day >= ?');
    values.push(query.minPrice);
  }

  if (query.maxPrice) {
    conditions.push('price_per_day <= ?');
    values.push(query.maxPrice);
  }

  // Availability filter
  if (query.available !== undefined) {
    conditions.push('available = ?');
    values.push(query.available);
  }

  // Status filter
  if (query.status) {
    conditions.push('status = ?');
    values.push(query.status);
  }

  // Brand filter
  if (query.brand) {
    conditions.push('brand = ?');
    values.push(query.brand);
  }

  // Color filter
  if (query.color) {
    conditions.push('color = ?');
    values.push(query.color);
  }

  // Rating filter
  if (query.minRating) {
    conditions.push('rating >= ?');
    values.push(query.minRating);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sort options
  let orderBy = 'created_at DESC';
  if (query.sortBy) {
    switch (query.sortBy) {
      case 'price-asc':
        orderBy = 'price_per_day ASC';
        break;
      case 'price-desc':
        orderBy = 'price_per_day DESC';
        break;
      case 'name-asc':
        orderBy = 'name ASC';
        break;
      case 'name-desc':
        orderBy = 'name DESC';
        break;
      case 'newest':
        orderBy = 'created_at DESC';
        break;
      case 'oldest':
        orderBy = 'created_at ASC';
        break;
    }
  }

  // Get total count
  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM gear ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  // Get gear
  const [gear] = await pool.execute<Array<any>>(
    `SELECT * FROM gear ${whereClause} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  // Parse JSON fields and convert numeric fields
  const parsedGear = gear.map((g: any) => ({
    ...g,
    images: parseJson<string[]>(g.images) || [],
    specifications: parseJson<Record<string, any>>(g.specifications) || {},
    recommended_products: parseJson<string[]>(g.recommended_products) || [],
    rating: g.rating !== null && g.rating !== undefined ? (typeof g.rating === 'number' ? g.rating : parseFloat(String(g.rating))) : null,
    price_per_day: g.price_per_day ? parseFloat(g.price_per_day) : 0,
    deposit: g.deposit ? parseFloat(g.deposit) : null,
  }));

  return {
    data: parsedGear,
    pagination: formatPagination({ page, limit, total }),
  };
};

/**
 * Get single gear by ID
 */
export const getGearById = async (id: string): Promise<Gear | null> => {
  const [gear] = await pool.execute<Array<any>>(
    'SELECT * FROM gear WHERE id = ?',
    [id]
  );

  if (isEmpty(gear)) {
    return null;
  }

  const item = gear[0];
  return {
    ...item,
    images: parseJson<string[]>(item.images) || [],
    specifications: parseJson<Record<string, any>>(item.specifications) || {},
    recommended_products: parseJson<string[]>(item.recommended_products) || [],
    rating: item.rating !== null && item.rating !== undefined 
      ? (() => {
          const parsed = typeof item.rating === 'number' 
            ? item.rating 
            : parseFloat(String(item.rating));
          return isNaN(parsed) ? null : parsed;
        })()
      : null,
  };
};

/**
 * Create new gear
 */
export const createGear = async (
  data: Omit<Gear, 'id' | 'created_at' | 'updated_at'>,
  userId?: string
): Promise<Gear> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO gear (
      id, name, description, category_id, images, price_per_day,
      deposit, available, status, specifications, brand, color,
      rating, recommended_products, owner_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name ?? null,
      data.description ?? null,
      data.category_id ?? null,
      JSON.stringify(data.images || []),
      data.price_per_day ?? null,
      data.deposit ?? null,
      data.available ?? true,
      data.status ?? null,
      JSON.stringify(data.specifications || {}),
      data.brand ?? null,
      data.color ?? null,
      data.rating ?? null,
      JSON.stringify(data.recommended_products || []),
      userId ?? null,
    ]
  );

  const gear = await getGearById(id);
  if (!gear) {
    throw new AppError('Failed to create gear', 500);
  }

  logger.info(`Gear created: ${id}`);
  return gear;
};

/**
 * Update gear
 */
export const updateGear = async (
  id: string,
  data: Partial<Gear>,
  userId?: string,
  isAdmin: boolean = false
): Promise<Gear> => {
  const existing = await getGearById(id);
  if (!existing) {
    throw new AppError('Gear not found', 404);
  }

  // Check ownership or admin
  if (!isAdmin && existing.owner_id !== userId) {
    throw new AppError('Unauthorized to update this gear', 403);
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (data.name) {
    updateFields.push('name = ?');
    updateValues.push(data.name);
  }
  if (data.description) {
    updateFields.push('description = ?');
    updateValues.push(data.description);
  }
  if (data.category_id !== undefined) {
    updateFields.push('category_id = ?');
    updateValues.push(data.category_id);
  }
  if (data.images) {
    updateFields.push('images = ?');
    updateValues.push(JSON.stringify(data.images));
  }
  if (data.price_per_day !== undefined) {
    updateFields.push('price_per_day = ?');
    updateValues.push(data.price_per_day);
  }
  if (data.deposit !== undefined) {
    updateFields.push('deposit = ?');
    updateValues.push(data.deposit);
  }
  if (data.available !== undefined) {
    updateFields.push('available = ?');
    updateValues.push(data.available);
  }
  if (data.status) {
    updateFields.push('status = ?');
    updateValues.push(data.status);
  }
  // Always update specifications if provided (even if empty object)
  if (data.specifications !== undefined) {
    updateFields.push('specifications = ?');
    updateValues.push(JSON.stringify(data.specifications || {}));
  }
  if (data.brand !== undefined) {
    updateFields.push('brand = ?');
    updateValues.push(data.brand);
  }
  if (data.color !== undefined) {
    updateFields.push('color = ?');
    updateValues.push(data.color);
  }
  // Always update rating if provided (even if null)
  if (data.rating !== undefined) {
    updateFields.push('rating = ?');
    // Ensure rating is a number or null (not string)
    const ratingValue = data.rating === null || data.rating === undefined 
      ? null 
      : (typeof data.rating === 'number' ? data.rating : parseFloat(String(data.rating)));
    const finalRatingValue = isNaN(ratingValue) ? null : ratingValue;
    updateValues.push(finalRatingValue);
    console.log('🔧 [updateGear] Rating update:', {
      original: data.rating,
      type: typeof data.rating,
      parsed: ratingValue,
      final: finalRatingValue,
      isNaN: isNaN(ratingValue)
    });
  } else {
    console.log('⚠️ [updateGear] Rating is undefined, not updating');
  }
  if (data.recommended_products) {
    updateFields.push('recommended_products = ?');
    updateValues.push(JSON.stringify(data.recommended_products));
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE gear SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getGearById(id);
  if (!updated) {
    throw new AppError('Failed to update gear', 500);
  }

  logger.info(`Gear updated: ${id}`);
  return updated;
};

/**
 * Delete gear
 */
export const deleteGear = async (
  id: string,
  userId?: string,
  isAdmin: boolean = false
): Promise<void> => {
  const gear = await getGearById(id);
  if (!gear) {
    throw new AppError('Gear not found', 404);
  }

  if (!isAdmin && gear.owner_id !== userId) {
    throw new AppError('Unauthorized to delete this gear', 403);
  }

  await pool.execute('DELETE FROM gear WHERE id = ?', [id]);
  logger.info(`Gear deleted: ${id}`);
};

/**
 * Search gear
 */
export const searchGear = async (searchTerm: string, limit: number = 10) => {
  const [gear] = await pool.execute<Array<any>>(
    `SELECT * FROM gear 
     WHERE MATCH(name, description) AGAINST(? IN NATURAL LANGUAGE MODE)
     OR name LIKE ? OR description LIKE ?
     LIMIT ?`,
    [searchTerm, `%${searchTerm}%`, `%${searchTerm}%`, limit]
  );

  return gear.map((g: any) => ({
    ...g,
    images: parseJson<string[]>(g.images) || [],
    specifications: parseJson<Record<string, any>>(g.specifications) || {},
    recommended_products: parseJson<string[]>(g.recommended_products) || [],
  }));
};

/**
 * Get gear by category
 */
export const getGearByCategory = async (categoryId: string) => {
  const [gear] = await pool.execute<Array<any>>(
    'SELECT * FROM gear WHERE category_id = ? ORDER BY created_at DESC',
    [categoryId]
  );

  return gear.map((g: any) => ({
    ...g,
    images: parseJson<string[]>(g.images) || [],
    specifications: parseJson<Record<string, any>>(g.specifications) || {},
    recommended_products: parseJson<string[]>(g.recommended_products) || [],
  }));
};

/**
 * Get recommended gear for a gear item
 */
export const getRecommendedGear = async (gearId: string) => {
  const gear = await getGearById(gearId);
  if (!gear || !gear.recommended_products || gear.recommended_products.length === 0) {
    return [];
  }

  const placeholders = gear.recommended_products.map(() => '?').join(',');
  const [recommended] = await pool.execute<Array<any>>(
    `SELECT * FROM gear WHERE id IN (${placeholders})`,
    gear.recommended_products
  );

  return recommended.map((g: any) => ({
    ...g,
    images: parseJson<string[]>(g.images) || [],
    specifications: parseJson<Record<string, any>>(g.specifications) || {},
    recommended_products: parseJson<string[]>(g.recommended_products) || [],
  }));
};













