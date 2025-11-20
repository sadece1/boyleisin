import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  checkSubscription,
} from '../services/newsletterService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const subscription = await subscribeNewsletter(email);
  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter',
    data: {
      ...subscription,
      subscribed_at: parseDate(subscription.subscribed_at),
      unsubscribed_at: subscription.unsubscribed_at ? parseDate(subscription.unsubscribed_at) : null,
      created_at: parseDate(subscription.created_at),
    },
  });
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await unsubscribeNewsletter(email);
  res.status(200).json({ success: true, message: 'Successfully unsubscribed from newsletter' });
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getSubscribers(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((s: any) => ({
      ...s,
      subscribed_at: parseDate(s.subscribed_at),
      unsubscribed_at: s.unsubscribed_at ? parseDate(s.unsubscribed_at) : null,
      created_at: parseDate(s.created_at),
    })),
    pagination: result.pagination,
  });
});

export const check = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params;
  const subscribed = await checkSubscription(email);
  res.status(200).json({ success: true, data: { subscribed } });
});













