import { Router } from 'express';
import {
  getAllFavorites,
  add,
  remove,
  check,
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllFavorites);
router.get('/check', authenticate, check);
router.post('/', authenticate, add);
router.delete('/:id', authenticate, remove);

export default router;













