import { Router } from 'express';
import {
  getDashboard,
  getUsers,
  updateUser,
  removeUser,
} from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorizeAdmin, getDashboard);
router.get('/users', authenticate, authorizeAdmin, getUsers);
router.put('/users/:id', authenticate, authorizeAdmin, updateUser);
router.delete('/users/:id', authenticate, authorizeAdmin, removeUser);

export default router;













