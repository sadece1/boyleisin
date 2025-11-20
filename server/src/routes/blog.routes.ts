import { Router } from 'express';
import {
  getAllPosts,
  getSinglePost,
  create,
  update,
  remove,
  incrementPostViews,
  getFeatured,
  getRecommended,
  search,
  getCategories,
} from '../controllers/blogController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, validateQuery, createBlogSchema, updateBlogSchema, blogFiltersSchema } from '../validators';

const router = Router();

router.get('/', validateQuery(blogFiltersSchema), getAllPosts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/search', search);
router.get('/recommended/:id', getRecommended);
router.post('/:id/view', incrementPostViews);
router.get('/:id', getSinglePost);
router.post('/', authenticate, authorizeAdmin, validate(createBlogSchema), create);
router.put('/:id', authenticate, authorizeAdmin, validate(updateBlogSchema), update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;













