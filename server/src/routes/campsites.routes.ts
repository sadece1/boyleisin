import { Router } from 'express';
import {
  getAllCampsites,
  getSingleCampsite,
  create,
  update,
  remove,
  search,
  getFilters,
} from '../controllers/campsiteController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, validateQuery, createCampsiteSchema, updateCampsiteSchema, campsiteFiltersSchema } from '../validators';

const router = Router();

router.get('/', validateQuery(campsiteFiltersSchema), getAllCampsites);
router.get('/search', search);
router.get('/filters', getFilters);
router.get('/:id', getSingleCampsite);
router.post('/', authenticate, validate(createCampsiteSchema), create);
router.put('/:id', authenticate, validate(updateCampsiteSchema), update);
router.delete('/:id', authenticate, remove); // Admin or owner can delete

export default router;













