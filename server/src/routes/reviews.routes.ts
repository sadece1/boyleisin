import { Router } from 'express';
import {
  getAllReviews,
  getSingleReview,
  getCampsiteReviews,
  getGearReviews,
  create,
  update,
  remove,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate, createReviewSchema, updateReviewSchema } from '../validators';

const router = Router();

router.get('/', getAllReviews);
router.get('/campsite/:campsiteId', getCampsiteReviews);
router.get('/gear/:gearId', getGearReviews);
router.get('/:id', getSingleReview);
router.post('/', authenticate, validate(createReviewSchema), create);
router.put('/:id', authenticate, validate(updateReviewSchema), update);
router.delete('/:id', authenticate, remove);

export default router;













