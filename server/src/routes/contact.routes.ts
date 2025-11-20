import { Router } from 'express';
import {
  create,
  getAll,
  markRead,
  remove,
} from '../controllers/contactController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, contactSchema } from '../validators';

const router = Router();

router.post('/', validate(contactSchema), create);
router.get('/messages', authenticate, authorizeAdmin, getAll);
router.put('/messages/:id/read', authenticate, authorizeAdmin, markRead);
router.delete('/messages/:id', authenticate, authorizeAdmin, remove);

export default router;
