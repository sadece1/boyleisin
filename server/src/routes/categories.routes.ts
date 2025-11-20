import { Router } from 'express';
import {
  getAllCategories,
  getTree,
  getSingleCategory,
  create,
  update,
  remove,
} from '../controllers/categoryController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, createCategorySchema, updateCategorySchema } from '../validators';

const router = Router();

router.get('/', getAllCategories);
router.get('/tree', getTree);
router.get('/:id', getSingleCategory);
router.post('/', authenticate, authorizeAdmin, validate(createCategorySchema), create);
router.put('/:id', authenticate, authorizeAdmin, validate(updateCategorySchema), update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;













