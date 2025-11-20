import { Router } from 'express';
import {
  create,
  getAll,
  getSingle,
  update,
  remove,
} from '../controllers/appointmentController';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate, appointmentSchema } from '../validators';

const router = Router();

router.post('/', validate(appointmentSchema), create);
router.get('/', authenticate, authorizeAdmin, getAll);
router.get('/:id', authenticate, authorizeAdmin, getSingle);
router.put('/:id', authenticate, authorizeAdmin, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

export default router;
