import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getUserOrders,
  getUserOrderById,
  createUserOrder,
  updateUserOrder,
  deleteUserOrder,
} from '../services/userOrderService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const requestedUserId = req.query.userId as string | undefined;
  const isAdmin = req.user.role === 'admin';
  
  // Non-admin users can only see their own orders
  const userId = isAdmin ? requestedUserId : req.user.id;
  
  const orders = await getUserOrders(userId);
  
  res.status(200).json({
    success: true,
    data: orders.map((order: any) => ({
      id: order.id,
      userId: order.user_id,
      gearId: order.gear_id,
      status: order.status,
      price: order.price,
      publicNote: order.public_note || undefined,
      privateNote: order.private_note || undefined,
      shippedDate: order.shipped_date || undefined,
      shippedTime: order.shipped_time || undefined,
      createdAt: parseDate(order.created_at),
      updatedAt: parseDate(order.updated_at),
    })),
  });
});

export const getSingleUserOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  const order = await getUserOrderById(id);
  
  if (!order) {
    res.status(404).json({ success: false, message: 'User order not found' });
    return;
  }

  // Non-admin users can only see their own orders
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && order.user_id !== req.user.id) {
    res.status(403).json({ success: false, message: 'You can only view your own orders' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id: order.id,
      userId: order.user_id,
      gearId: order.gear_id,
      status: order.status,
      price: order.price,
      publicNote: order.public_note || undefined,
      privateNote: order.private_note || undefined,
      shippedDate: order.shipped_date || undefined,
      shippedTime: order.shipped_time || undefined,
      createdAt: parseDate(order.created_at),
      updatedAt: parseDate(order.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  // Users can only create orders for themselves (unless admin)
  const requestedUserId = req.body.userId;
  const isAdmin = req.user.role === 'admin';
  
  if (requestedUserId && requestedUserId !== req.user.id && !isAdmin) {
    res.status(403).json({ success: false, message: 'You can only create orders for yourself' });
    return;
  }

  const order = await createUserOrder({
    user_id: requestedUserId || req.user.id, // Use authenticated user's ID if not specified
    gear_id: req.body.gearId,
    status: req.body.status,
    price: req.body.price,
    public_note: req.body.publicNote || null,
    private_note: req.body.privateNote || null,
    shipped_date: req.body.shippedDate || null,
    shipped_time: req.body.shippedTime || null,
  });

  res.status(201).json({
    success: true,
    message: 'User order created successfully',
    data: {
      id: order.id,
      userId: order.user_id,
      gearId: order.gear_id,
      status: order.status,
      price: order.price,
      publicNote: order.public_note || undefined,
      privateNote: order.private_note || undefined,
      shippedDate: order.shipped_date || undefined,
      shippedTime: order.shipped_time || undefined,
      createdAt: parseDate(order.created_at),
      updatedAt: parseDate(order.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  
  // Prepare update data, only include fields that are provided
  const updateData: any = {};
  
  if (req.body.status !== undefined) {
    updateData.status = req.body.status;
  }
  if (req.body.price !== undefined) {
    // Ensure price is a number
    const priceValue = typeof req.body.price === 'string' ? parseFloat(req.body.price) : req.body.price;
    updateData.price = isNaN(priceValue) ? 0 : priceValue;
  }
  if (req.body.publicNote !== undefined) {
    updateData.public_note = req.body.publicNote === '' ? null : req.body.publicNote;
  }
  if (req.body.privateNote !== undefined) {
    updateData.private_note = req.body.privateNote === '' ? null : req.body.privateNote;
  }
  if (req.body.shippedDate !== undefined) {
    updateData.shipped_date = req.body.shippedDate === '' ? null : req.body.shippedDate;
  }
  if (req.body.shippedTime !== undefined) {
    updateData.shipped_time = req.body.shippedTime === '' ? null : req.body.shippedTime;
  }

  const order = await updateUserOrder(id, updateData);

  res.status(200).json({
    success: true,
    message: 'User order updated successfully',
    data: {
      id: order.id,
      userId: order.user_id,
      gearId: order.gear_id,
      status: order.status,
      price: order.price,
      publicNote: order.public_note || undefined,
      privateNote: order.private_note || undefined,
      shippedDate: order.shipped_date || undefined,
      shippedTime: order.shipped_time || undefined,
      createdAt: parseDate(order.created_at),
      updatedAt: parseDate(order.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteUserOrder(id);
  res.status(200).json({ success: true, message: 'User order deleted successfully' });
});

