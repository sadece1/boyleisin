import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from '../services/reviewService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await getReviews(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((r: any) => ({
      ...r,
      created_at: parseDate(r.created_at),
    })),
    pagination: result.pagination,
  });
});

export const getSingleReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const review = await getReviewById(id);
  if (!review) {
    res.status(404).json({ success: false, message: 'Review not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...review,
      created_at: parseDate(review.created_at),
    },
  });
});

export const getCampsiteReviews = asyncHandler(async (req: Request, res: Response) => {
  const { campsiteId } = req.params;
  const result = await getReviews({ campsite_id: campsiteId });
  res.status(200).json({
    success: true,
    data: result.data.map((r: any) => ({
      ...r,
      created_at: parseDate(r.created_at),
    })),
    pagination: result.pagination,
  });
});

export const getGearReviews = asyncHandler(async (req: Request, res: Response) => {
  const { gearId } = req.params;
  const result = await getReviews({ gear_id: gearId });
  res.status(200).json({
    success: true,
    data: result.data.map((r: any) => ({
      ...r,
      created_at: parseDate(r.created_at),
    })),
    pagination: result.pagination,
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const review = await createReview(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: {
      ...review,
      created_at: parseDate(review.created_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const review = await updateReview(id, req.body, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: {
      ...review,
      created_at: parseDate(review.created_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  await deleteReview(id, req.user.id, isAdmin);

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
});













