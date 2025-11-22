import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getGear,
  getGearById,
  createGear,
  updateGear,
  deleteGear,
  searchGear,
  getGearByCategory,
  getRecommendedGear,
} from '../services/gearService';
import { getCategoryById, getCategoryBySlug } from '../services/categoryService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

/**
 * Get all gear
 */
export const getAllGear = asyncHandler(async (req: Request, res: Response) => {
  const result = await getGear(req.query);

  res.status(200).json({
    success: true,
    data: result.data.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
    pagination: result.pagination,
  });
});

/**
 * Get single gear
 */
export const getSingleGear = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gear = await getGearById(id);

  if (!gear) {
    res.status(404).json({
      success: false,
      message: 'Gear not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Create gear
 */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Parse FormData fields - extract image URLs from image_0, image_1, etc.
  const images: string[] = [];
  let imageIndex = 0;
  while (req.body[`image_${imageIndex}`]) {
    const imageUrl = req.body[`image_${imageIndex}`];
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      images.push(imageUrl.trim());
    }
    imageIndex++;
  }

  // Parse specifications if it's a string (JSON)
  let specifications = req.body.specifications;
  if (typeof specifications === 'string') {
    try {
      specifications = JSON.parse(specifications);
    } catch (e) {
      specifications = {};
    }
  }

  // Parse recommended_products if it's a string (JSON)
  let recommended_products = req.body.recommendedProducts || req.body.recommended_products;
  if (typeof recommended_products === 'string') {
    try {
      recommended_products = JSON.parse(recommended_products);
    } catch (e) {
      recommended_products = [];
    }
  }

  // Parse numeric fields
  const price_per_day = req.body.price_per_day 
    ? (typeof req.body.price_per_day === 'string' ? parseFloat(req.body.price_per_day) : req.body.price_per_day)
    : null;
  const deposit = req.body.deposit 
    ? (typeof req.body.deposit === 'string' ? parseFloat(req.body.deposit) : req.body.deposit)
    : null;

  // Build gear data object
  const gearData: any = {
    name: req.body.name || null,
    description: req.body.description || null,
    category_id: req.body.category_id || null,
    images: images.length > 0 ? images : (req.body.images || []),
    price_per_day: price_per_day,
    deposit: deposit !== null && deposit !== undefined ? deposit : null,
    available: req.body.available !== undefined ? (req.body.available === 'true' || req.body.available === true) : true,
    status: req.body.status || null,
    specifications: specifications || {},
    brand: req.body.brand || null,
    color: req.body.color || null,
    recommended_products: recommended_products || [],
  };

  const gear = await createGear(gearData, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Gear created successfully',
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Update gear
 */
export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  const gear = await updateGear(id, req.body, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Gear updated successfully',
    data: {
      ...gear,
      created_at: parseDate(gear.created_at),
      updated_at: parseDate(gear.updated_at),
    },
  });
});

/**
 * Delete gear
 */
export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';

  await deleteGear(id, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Gear deleted successfully',
  });
});

/**
 * Search gear
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Search query is required',
    });
    return;
  }

  const gear = await searchGear(q);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});

/**
 * Get gear by category
 */
export const getByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const gear = await getGearByCategory(categoryId);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});

/**
 * Get recommended gear
 */
export const getRecommended = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const gear = await getRecommendedGear(id);

  res.status(200).json({
    success: true,
    data: gear.map((g: any) => ({
      ...g,
      created_at: parseDate(g.created_at),
      updated_at: parseDate(g.updated_at),
    })),
  });
});













