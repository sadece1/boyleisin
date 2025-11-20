import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getAll,
  check,
} from '../controllers/newsletterController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, newsletterSubscribeSchema } from '../validators';

const router = Router();

router.post('/subscribe', validate(newsletterSubscribeSchema), subscribe);
router.post('/unsubscribe', validate(newsletterSubscribeSchema), unsubscribe);
router.get('/check/:email', check);
router.get('/subscribers', authenticate, authorizeAdmin, getAll);
// Frontend compatibility: GET / -> getAll (for /api/newsletters)
router.get('/', authenticate, authorizeAdmin, getAll);

export default router;
