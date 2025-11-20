import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createContactMessage,
  getContactMessages,
  markAsRead,
  deleteContactMessage,
} from '../services/contactService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const message = await createContactMessage(req.body);
  res.status(201).json({
    success: true,
    message: 'Contact message sent successfully',
    data: {
      ...message,
      created_at: parseDate(message.created_at),
      updated_at: parseDate(message.updated_at),
    },
  });
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getContactMessages(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((m: any) => ({
      ...m,
      created_at: parseDate(m.created_at),
      updated_at: parseDate(m.updated_at),
    })),
    pagination: result.pagination,
  });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await markAsRead(id);
  res.status(200).json({ success: true, message: 'Message marked as read' });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteContactMessage(id);
  res.status(200).json({ success: true, message: 'Message deleted successfully' });
});













