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

  const gear = await createGear(req.body, req.user.id);

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













