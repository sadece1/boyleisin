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
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Multer middleware for parsing FormData (no file upload, just text fields)
const parseFormData = upload.none();

// Middleware to transform FormData to validation-friendly format
const transformFormData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

  // If images array is populated, replace req.body.images
  if (images.length > 0) {
    req.body.images = images;
  }

  // Parse specifications if it's a string (JSON)
  if (req.body.specifications && typeof req.body.specifications === 'string') {
    try {
      req.body.specifications = JSON.parse(req.body.specifications);
    } catch (e) {
      req.body.specifications = {};
    }
  }

  // Parse recommended_products if it's a string (JSON)
  if (req.body.recommendedProducts && typeof req.body.recommendedProducts === 'string') {
    try {
      req.body.recommended_products = JSON.parse(req.body.recommendedProducts);
    } catch (e) {
      req.body.recommended_products = [];
    }
  } else if (req.body.recommended_products && typeof req.body.recommended_products === 'string') {
    try {
      req.body.recommended_products = JSON.parse(req.body.recommended_products);
    } catch (e) {
      req.body.recommended_products = [];
    }
  }

  // Convert string numbers to numbers
  if (req.body.price_per_day) {
    if (typeof req.body.price_per_day === 'string') {
      req.body.price_per_day = parseFloat(req.body.price_per_day);
    }
  }
  if (req.body.deposit) {
    if (typeof req.body.deposit === 'string') {
      req.body.deposit = parseFloat(req.body.deposit);
    }
  }

  // Convert string boolean to boolean
  if (req.body.available !== undefined) {
    if (typeof req.body.available === 'string') {
      req.body.available = req.body.available === 'true' || req.body.available === '1';
    }
  }

  next();
});

router.get('/', validateQuery(gearFiltersSchema), getAllGear);
router.get('/search', search);
router.get('/by-category/:categoryId', getByCategory);
router.get('/recommended/:id', getRecommended);
router.get('/:id', getSingleGear);
router.post('/', authenticate, parseFormData, transformFormData, validate(createGearSchema), create);
router.put('/:id', authenticate, parseFormData, transformFormData, validate(updateGearSchema), update);
router.delete('/:id', authenticate, remove);

export default router;













