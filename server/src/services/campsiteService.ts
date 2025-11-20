import pool from '../config/database';
import { Campsite } from '../types';
import { generateId, parseJson, getPaginationParams, formatPagination, isEmpty } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get all campsites with filters and pagination
 */
export const getCampsites = async (query: any) => {
  const { page, limit, offset } = getPaginationParams(query);
  const conditions: string[] = [];
  const values: any[] = [];

  // Search filter
  if (query.search) {
    conditions.push(`(name LIKE ? OR description LIKE ? OR location_city LIKE ?)`);
    const searchTerm = `%${query.search}%`;
    values.push(searchTerm, searchTerm, searchTerm);
  }

  // City filter
  if (query.city) {
    conditions.push('location_city = ?');
    values.push(query.city);
  }

  // Region filter
  if (query.region) {
    conditions.push('location_region = ?');
    values.push(query.region);
  }

  // Price filters
  if (query.minPrice) {
    conditions.push('price_per_night >= ?');
    values.push(query.minPrice);
  }

  if (query.maxPrice) {
    conditions.push('price_per_night <= ?');
    values.push(query.maxPrice);
  }

  // Capacity filter
  if (query.capacity) {
    conditions.push('capacity >= ?');
    values.push(query.capacity);
  }

  // Availability filter
  if (query.available !== undefined) {
    conditions.push('available = ?');
    values.push(query.available);
  }

  // Rating filter
  if (query.minRating) {
    conditions.push('rating >= ?');
    values.push(query.minRating);
  }

  // Amenities filter
  if (query.amenities && Array.isArray(query.amenities) && query.amenities.length > 0) {
    // MySQL JSON search for amenities
    const amenityConditions = query.amenities.map(() => 'JSON_CONTAINS(amenities, ?)').join(' AND ');
    conditions.push(`(${amenityConditions})`);
    values.push(...query.amenities.map((a: string) => JSON.stringify(a)));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const [countResult] = await pool.execute<Array<any>>(
    `SELECT COUNT(*) as total FROM campsites ${whereClause}`,
    values
  );
  const total = countResult[0].total;

  // Get campsites
  const [campsites] = await pool.execute<Array<any>>(
    `SELECT * FROM campsites ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  // Parse JSON fields
  const parsedCampsites = campsites.map((c: any) => ({
    ...c,
    images: parseJson<string[]>(c.images) || [],
    amenities: parseJson<string[]>(c.amenities) || [],
    rules: parseJson<string[]>(c.rules) || [],
  }));

  return {
    data: parsedCampsites,
    pagination: formatPagination({ page, limit, total }),
  };
};

/**
 * Get single campsite by ID
 */
export const getCampsiteById = async (id: string): Promise<Campsite | null> => {
  const [campsites] = await pool.execute<Array<any>>(
    'SELECT * FROM campsites WHERE id = ?',
    [id]
  );

  if (isEmpty(campsites)) {
    return null;
  }

  const campsite = campsites[0];
  return {
    ...campsite,
    images: parseJson<string[]>(campsite.images) || [],
    amenities: parseJson<string[]>(campsite.amenities) || [],
    rules: parseJson<string[]>(campsite.rules) || [],
  };
};

/**
 * Create new campsite
 */
export const createCampsite = async (
  data: Omit<Campsite, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>,
  userId?: string
): Promise<Campsite> => {
  const id = generateId();

  await pool.execute(
    `INSERT INTO campsites (
      id, name, description, location_address, location_city, location_region,
      location_lat, location_lng, images, amenities, rules, capacity,
      price_per_night, available, owner_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.description,
      data.location_address,
      data.location_city,
      data.location_region,
      data.location_lat || null,
      data.location_lng || null,
      JSON.stringify(data.images || []),
      JSON.stringify(data.amenities || []),
      JSON.stringify(data.rules || []),
      data.capacity,
      data.price_per_night,
      data.available ?? true,
      userId || null,
    ]
  );

  const campsite = await getCampsiteById(id);
  if (!campsite) {
    throw new AppError('Failed to create campsite', 500);
  }

  logger.info(`Campsite created: ${id}`);
  return campsite;
};

/**
 * Update campsite
 */
export const updateCampsite = async (
  id: string,
  data: Partial<Campsite>,
  userId?: string,
  isAdmin: boolean = false
): Promise<Campsite> => {
  // Check if campsite exists
  const existing = await getCampsiteById(id);
  if (!existing) {
    throw new AppError('Campsite not found', 404);
  }

  // Check ownership or admin
  if (!isAdmin && existing.owner_id !== userId) {
    throw new AppError('Unauthorized to update this campsite', 403);
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
  if (data.location_address) {
    updateFields.push('location_address = ?');
    updateValues.push(data.location_address);
  }
  if (data.location_city) {
    updateFields.push('location_city = ?');
    updateValues.push(data.location_city);
  }
  if (data.location_region) {
    updateFields.push('location_region = ?');
    updateValues.push(data.location_region);
  }
  if (data.location_lat !== undefined) {
    updateFields.push('location_lat = ?');
    updateValues.push(data.location_lat);
  }
  if (data.location_lng !== undefined) {
    updateFields.push('location_lng = ?');
    updateValues.push(data.location_lng);
  }
  if (data.images) {
    updateFields.push('images = ?');
    updateValues.push(JSON.stringify(data.images));
  }
  if (data.amenities) {
    updateFields.push('amenities = ?');
    updateValues.push(JSON.stringify(data.amenities));
  }
  if (data.rules) {
    updateFields.push('rules = ?');
    updateValues.push(JSON.stringify(data.rules));
  }
  if (data.capacity !== undefined) {
    updateFields.push('capacity = ?');
    updateValues.push(data.capacity);
  }
  if (data.price_per_night !== undefined) {
    updateFields.push('price_per_night = ?');
    updateValues.push(data.price_per_night);
  }
  if (data.available !== undefined) {
    updateFields.push('available = ?');
    updateValues.push(data.available);
  }

  if (updateFields.length === 0) {
    return existing;
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await pool.execute(
    `UPDATE campsites SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  const updated = await getCampsiteById(id);
  if (!updated) {
    throw new AppError('Failed to update campsite', 500);
  }

  logger.info(`Campsite updated: ${id}`);
  return updated;
};

/**
 * Delete campsite
 */
export const deleteCampsite = async (
  id: string,
  userId?: string,
  isAdmin: boolean = false
): Promise<void> => {
  const campsite = await getCampsiteById(id);
  if (!campsite) {
    throw new AppError('Campsite not found', 404);
  }

  // Check ownership or admin
  if (!isAdmin && campsite.owner_id !== userId) {
    throw new AppError('Unauthorized to delete this campsite', 403);
  }

  await pool.execute('DELETE FROM campsites WHERE id = ?', [id]);
  logger.info(`Campsite deleted: ${id}`);
};

/**
 * Search campsites
 */
export const searchCampsites = async (searchTerm: string, limit: number = 10) => {
  const [campsites] = await pool.execute<Array<any>>(
    `SELECT * FROM campsites 
     WHERE MATCH(name, description, location_city, location_region) AGAINST(? IN NATURAL LANGUAGE MODE)
     OR name LIKE ? OR description LIKE ? OR location_city LIKE ?
     LIMIT ?`,
    [
      searchTerm,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      limit,
    ]
  );

  return campsites.map((c: any) => ({
    ...c,
    images: parseJson<string[]>(c.images) || [],
    amenities: parseJson<string[]>(c.amenities) || [],
    rules: parseJson<string[]>(c.rules) || [],
  }));
};

/**
 * Get filter options (cities, regions, etc.)
 */
export const getFilterOptions = async () => {
  const [cities] = await pool.execute<Array<any>>(
    'SELECT DISTINCT location_city FROM campsites WHERE location_city IS NOT NULL ORDER BY location_city'
  );
  const [regions] = await pool.execute<Array<any>>(
    'SELECT DISTINCT location_region FROM campsites WHERE location_region IS NOT NULL ORDER BY location_region'
  );
  const [amenities] = await pool.execute<Array<any>>(
    'SELECT DISTINCT amenities FROM campsites WHERE amenities IS NOT NULL'
  );

  const allAmenities = new Set<string>();
  amenities.forEach((item: any) => {
    const parsed = parseJson<string[]>(item.amenities);
    if (parsed) {
      parsed.forEach((a) => allAmenities.add(a));
    }
  });

  return {
    cities: cities.map((c) => c.location_city),
    regions: regions.map((r) => r.location_region),
    amenities: Array.from(allAmenities),
  };
};













