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
import { createGearSchema, updateGearSchema } from '../validators';

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
 * Helper to parse FormData or JSON body and resolve category slug to ID
 * Note: Express doesn't parse multipart/form-data automatically, 
 * so we handle both JSON and urlencoded formats
 */
const parseGearData = async (req: Request): Promise<any> => {
  const body: any = {};
  
  // Handle both camelCase (from frontend) and snake_case (from backend)
  if (req.body.name) body.name = req.body.name;
  if (req.body.description) body.description = req.body.description;
  
  // Handle category_id - can be categoryId, category_id, or category (slug)
  // Try to resolve slug to ID if needed
  let categoryId: string | undefined;
  if (req.body.categoryId) {
    categoryId = req.body.categoryId;
  } else if (req.body.category_id) {
    categoryId = req.body.category_id;
  } else if (req.body.category) {
    categoryId = req.body.category; // Will be resolved below if it's a slug
  }
  
  // If categoryId looks like a slug (not UUID format), try to find category by slug
  if (categoryId && !categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    // Likely a slug, try to find category
    try {
      const category = await getCategoryBySlug(categoryId);
      if (category) {
        body.category_id = category.id;
      } else {
        // If not found by slug, try to find by ID (maybe it's an ID that doesn't match UUID format)
        const categoryById = await getCategoryById(categoryId);
        if (categoryById) {
          body.category_id = categoryById.id;
        } else {
          // If not found, use as-is (validation will catch if invalid)
          body.category_id = categoryId;
        }
      }
    } catch (error) {
      // If error, use as-is (validation will catch if invalid)
      body.category_id = categoryId;
    }
  } else if (categoryId) {
    body.category_id = categoryId;
  }
  
  // Handle images - can be array or individual image_0, image_1, etc.
  if (req.body.images) {
    body.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  } else {
    // Check for image_0, image_1, etc. pattern
    const images: string[] = [];
    let index = 0;
    while (req.body[`image_${index}`]) {
      const url = req.body[`image_${index}`];
      if (url && typeof url === 'string' && url.trim()) {
        images.push(url.trim());
      }
      index++;
    }
    if (images.length > 0) {
      body.images = images;
    }
  }
  
  // Handle price_per_day
  if (req.body.pricePerDay !== undefined) {
    body.price_per_day = parseFloat(String(req.body.pricePerDay));
  } else if (req.body.price_per_day !== undefined) {
    body.price_per_day = parseFloat(String(req.body.price_per_day));
  }
  
  // Handle deposit
  if (req.body.deposit !== undefined && req.body.deposit !== null && req.body.deposit !== '') {
    body.deposit = parseFloat(String(req.body.deposit));
  }
  
  // Handle status
  if (req.body.status) {
    body.status = req.body.status;
  }
  
  // Handle available
  if (req.body.available !== undefined) {
    body.available = req.body.available === 'true' || req.body.available === true || req.body.available === '1';
  }
  
  // Handle optional fields
  if (req.body.brand) body.brand = req.body.brand;
  if (req.body.color) body.color = req.body.color;
  if (req.body.specifications) {
    body.specifications = typeof req.body.specifications === 'string' 
      ? JSON.parse(req.body.specifications) 
      : req.body.specifications;
  }
  if (req.body.recommendedProducts) {
    body.recommended_products = typeof req.body.recommendedProducts === 'string'
      ? JSON.parse(req.body.recommendedProducts)
      : req.body.recommendedProducts;
  } else if (req.body.recommended_products) {
    body.recommended_products = typeof req.body.recommended_products === 'string'
      ? JSON.parse(req.body.recommended_products)
      : req.body.recommended_products;
  }
  
  return body;
};

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

  // Parse FormData or JSON
  const gearData = parseGearData(req);
  
  // Validate parsed data
  const { error, value } = createGearSchema.validate(gearData, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }
  
  const gear = await createGear(value, req.user.id);

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

  // Parse FormData or JSON
  const gearData = parseGearData(req);
  
  // Validate parsed data
  const { error, value } = updateGearSchema.validate(gearData, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
    return;
  }
  
  const gear = await updateGear(id, value, req.user.id, isAdmin);

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













