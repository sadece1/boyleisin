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
router.patch('/messages/:id/read', authenticate, authorizeAdmin, markRead);
router.put('/messages/:id/read', authenticate, authorizeAdmin, markRead); // Keep PUT for backward compatibility
router.delete('/messages/:id', authenticate, authorizeAdmin, remove);

export default router;
