import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../services/favoriteService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const favorites = await getFavorites(req.user.id);
  res.status(200).json({
    success: true,
    data: favorites.map((f: any) => ({
      ...f,
      created_at: parseDate(f.created_at),
    })),
  });
});

export const add = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const favorite = await addFavorite(req.body, req.user.id);
  res.status(201).json({
    success: true,
    message: 'Added to favorites',
    data: {
      ...favorite,
      created_at: parseDate(favorite.created_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  await removeFavorite(id, req.user.id);

  res.status(200).json({ success: true, message: 'Removed from favorites' });
});

export const check = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { campsite_id, gear_id } = req.query;
  const isFavorited = await checkFavorite(
    req.user.id,
    campsite_id as string,
    gear_id as string
  );

  res.status(200).json({ success: true, data: { isFavorited } });
});













