import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../services/adminService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await getDashboardStats();
  res.status(200).json({ success: true, data: stats });
});

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getAllUsers(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((u: any) => ({
      ...u,
      created_at: parseDate(u.created_at),
      updated_at: parseDate(u.updated_at),
    })),
    pagination: result.pagination,
  });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role' });
    return;
  }

  await updateUserRole(id, role);
  res.status(200).json({ success: true, message: 'User role updated successfully' });
});

export const removeUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteUser(id);
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});













