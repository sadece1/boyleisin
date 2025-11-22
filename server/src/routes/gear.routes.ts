import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllGear,
  getSingleGear,
  create,
  update,
  remove,
  search,
  getByCategory,
  getRecommended,
} from '../controllers/gearController';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery, createGearSchema, updateGearSchema, gearFiltersSchema } from '../validators';
import { upload } from '../middleware/upload';

const router = Router();

// Multer middleware for parsing FormData (no file upload, just text fields)
const parseFormData = upload.none();

// Middleware to handle both JSON and FormData
const parseBody = (req: Request, res: Response, next: NextFunction) => {
  // If Content-Type is multipart/form-data, use multer
  // Otherwise, express.json() already parsed it
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return parseFormData(req, res, next);
  }
  // For JSON, express.json() already parsed it, just continue
  next();
};

// Middleware to transform FormData to expected format for validation
const transformFormData = (req: Request, res: Response, next: NextFunction) => {
  // Extract image URLs from image_0, image_1, etc.
  const images: string[] = [];
  let imageIndex = 0;
  while (req.body[`image_${imageIndex}`]) {
    const imageUrl = req.body[`image_${imageIndex}`];
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      images.push(imageUrl.trim());
    }
    imageIndex++;
  }
  // Always set images array (even if empty) - validation will handle it
  req.body.images = images.length > 0 ? images : undefined;

  // Parse specifications if it's a string (JSON)
  if (req.body.specifications && typeof req.body.specifications === 'string') {
    try {
      req.body.specifications = JSON.parse(req.body.specifications);
    } catch (e) {
      req.body.specifications = undefined;
    }
  }

  // Parse recommended_products if it's a string (JSON)
  const recommendedProducts = req.body.recommendedProducts || req.body.recommended_products;
  if (recommendedProducts && typeof recommendedProducts === 'string') {
    try {
      req.body.recommended_products = JSON.parse(recommendedProducts);
    } catch (e) {
      req.body.recommended_products = undefined;
    }
  } else if (recommendedProducts && Array.isArray(recommendedProducts)) {
    req.body.recommended_products = recommendedProducts;
  } else if (!recommendedProducts) {
    req.body.recommended_products = undefined;
  }

  // Convert string numbers to numbers (required fields)
  if (req.body.price_per_day !== undefined && req.body.price_per_day !== null && req.body.price_per_day !== '') {
    const parsed = typeof req.body.price_per_day === 'string' 
      ? parseFloat(req.body.price_per_day) 
      : req.body.price_per_day;
    req.body.price_per_day = isNaN(parsed) ? undefined : parsed;
  } else {
    req.body.price_per_day = undefined;
  }

  if (req.body.deposit !== undefined && req.body.deposit !== null && req.body.deposit !== '') {
    const parsed = typeof req.body.deposit === 'string' 
      ? parseFloat(req.body.deposit) 
      : req.body.deposit;
    req.body.deposit = isNaN(parsed) ? undefined : parsed;
  } else {
    req.body.deposit = undefined;
  }

  // Parse rating - convert string to number or keep as number
  if (req.body.rating !== undefined && req.body.rating !== null && req.body.rating !== '') {
    const parsed = typeof req.body.rating === 'string'
      ? parseFloat(req.body.rating)
      : req.body.rating;
    req.body.rating = isNaN(parsed) ? undefined : parsed;
  } else {
    req.body.rating = undefined;
  }

  // Convert string boolean to boolean
  if (req.body.available !== undefined) {
    req.body.available = req.body.available === 'true' || req.body.available === true;
  }

  // Ensure category_id is a string (UUID validation will handle format)
  if (req.body.category_id) {
    req.body.category_id = String(req.body.category_id).trim();
  }

  // Ensure name and description are strings
  if (req.body.name) {
    req.body.name = String(req.body.name).trim();
  }
  if (req.body.description) {
    req.body.description = String(req.body.description).trim();
  }

  // Ensure status is a string
  if (req.body.status) {
    req.body.status = String(req.body.status).trim();
  }

  next();
};

router.get('/', validateQuery(gearFiltersSchema), getAllGear);
router.get('/search', search);
router.get('/by-category/:categoryId', getByCategory);
router.get('/recommended/:id', getRecommended);
router.get('/:id', getSingleGear);
router.post('/', authenticate, parseFormData, transformFormData, validate(createGearSchema), create);
router.put('/:id', authenticate, parseBody, transformFormData, validate(updateGearSchema), update);
router.delete('/:id', authenticate, remove);

export default router;













