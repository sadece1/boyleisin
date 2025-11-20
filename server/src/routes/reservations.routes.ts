import { Router } from 'express';
import {
  getAllReservations,
  getSingleReservation,
  create,
  update,
  remove,
  checkAvail,
} from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';
import { validate, updateReservationSchema, createReservationSchema } from '../validators';

const router = Router();

router.get('/availability', checkAvail);
router.get('/', authenticate, getAllReservations);
router.get('/:id', authenticate, getSingleReservation);
router.post('/', authenticate, validate(createReservationSchema), create);
router.put('/:id', authenticate, validate(updateReservationSchema), update);
router.delete('/:id', authenticate, remove);

export default router;
