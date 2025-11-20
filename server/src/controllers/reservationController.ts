import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkAvailability,
} from '../services/reservationService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const getAllReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const isAdmin = req.user.role === 'admin';
  const result = await getReservations(req.query, isAdmin ? undefined : req.user.id);

  res.status(200).json({
    success: true,
    data: result.data.map((r: any) => ({
      ...r,
      start_date: parseDate(r.start_date),
      end_date: parseDate(r.end_date),
      created_at: parseDate(r.created_at),
      updated_at: parseDate(r.updated_at),
    })),
    pagination: result.pagination,
  });
});

export const getSingleReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  const reservation = await getReservationById(id, req.user.id, isAdmin);

  if (!reservation) {
    res.status(404).json({ success: false, message: 'Reservation not found' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      ...reservation,
      start_date: parseDate(reservation.start_date),
      end_date: parseDate(reservation.end_date),
      created_at: parseDate(reservation.created_at),
      updated_at: parseDate(reservation.updated_at),
    },
  });
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const reservation = await createReservation(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Reservation created successfully',
    data: {
      ...reservation,
      start_date: parseDate(reservation.start_date),
      end_date: parseDate(reservation.end_date),
      created_at: parseDate(reservation.created_at),
      updated_at: parseDate(reservation.updated_at),
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
  const reservation = await updateReservation(id, req.body, req.user.id, isAdmin);

  res.status(200).json({
    success: true,
    message: 'Reservation updated successfully',
    data: {
      ...reservation,
      start_date: parseDate(reservation.start_date),
      end_date: parseDate(reservation.end_date),
      created_at: parseDate(reservation.created_at),
      updated_at: parseDate(reservation.updated_at),
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
  await deleteReservation(id, req.user.id, isAdmin);

  res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
});

export const checkAvail = asyncHandler(async (req: Request, res: Response) => {
  const { campsite_id, start_date, end_date } = req.query;

  if (!campsite_id || !start_date || !end_date) {
    res.status(400).json({ success: false, message: 'Missing required parameters' });
    return;
  }

  const available = await checkAvailability(
    campsite_id as string,
    new Date(start_date as string),
    new Date(end_date as string)
  );

  res.status(200).json({ success: true, data: { available } });
});













