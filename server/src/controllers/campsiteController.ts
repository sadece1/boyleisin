import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getCampsites,
  getCampsiteById,
  createCampsite,
  updateCampsite,
  deleteCampsite,
  searchCampsites,
  getFilterOptions,
} from '../services/campsiteService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

/**
 * Get all campsites
 */
export const getAllCampsites = asyncHandler(async (req: Request, res: Response) => {
  const result = await getCampsites(req.query);

  res.status(200).json({
    success: true,
    data: result.data.map((c: any) => ({
      ...c,
      created_at: parseDate(c.created_at),
      updated_at: parseDate(c.updated_at),
    })),
    pagination: result.pagination,
  });
});

/**
 * Get single campsite
 */
export const getSingleCampsite = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const campsite = await getCampsiteById(id);

  if (!campsite) {
    res.status(404).json({
      success: false,
      message: 'Campsite not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...campsite,
      created_at: parseDate(campsite.created_at),
      updated_at: parseDate(campsite.updated_at),
    },
  });
});

/**
 * Create campsite
 */
export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  const campsite = await createCampsite(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Campsite created successfully',
    data: {
      ...campsite,
      created_at: parseDate(campsite.created_at),
      updated_at: parseDate(campsite.updated_at),
    },
  });
});

/**
 * Update campsite
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

  const campsite = await updateCampsite(id, req.body, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Campsite updated successfully',
    data: {
      ...campsite,
      created_at: parseDate(campsite.created_at),
      updated_at: parseDate(campsite.updated_at),
    },
  });
});

/**
 * Delete campsite
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

  await deleteCampsite(id, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Campsite deleted successfully',
  });
});

/**
 * Search campsites
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

  const campsites = await searchCampsites(q);

  res.status(200).json({
    success: true,
    data: campsites.map((c: any) => ({
      ...c,
      created_at: parseDate(c.created_at),
      updated_at: parseDate(c.updated_at),
    })),
  });
});

/**
 * Get filter options
 */
export const getFilters = asyncHandler(async (req: Request, res: Response) => {
  const options = await getFilterOptions();

  res.status(200).json({
    success: true,
    data: options,
  });
});













