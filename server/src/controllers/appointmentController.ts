import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../services/appointmentService';
import { asyncHandler } from '../middleware/errorHandler';
import { parseDate } from '../utils/helpers';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await createAppointment(req.body);
  res.status(201).json({
    success: true,
    message: 'Appointment created successfully',
    data: {
      ...appointment,
      date: parseDate(appointment.date),
      created_at: parseDate(appointment.created_at),
      updated_at: parseDate(appointment.updated_at),
    },
  });
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await getAppointments(req.query);
  res.status(200).json({
    success: true,
    data: result.data.map((a: any) => ({
      ...a,
      date: parseDate(a.date),
      created_at: parseDate(a.created_at),
      updated_at: parseDate(a.updated_at),
    })),
    pagination: result.pagination,
  });
});

export const getSingle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const appointment = await getAppointmentById(id);
  if (!appointment) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: {
      ...appointment,
      date: parseDate(appointment.date),
      created_at: parseDate(appointment.created_at),
      updated_at: parseDate(appointment.updated_at),
    },
  });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const appointment = await updateAppointment(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: {
      ...appointment,
      date: parseDate(appointment.date),
      created_at: parseDate(appointment.created_at),
      updated_at: parseDate(appointment.updated_at),
    },
  });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await deleteAppointment(id);
  res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
});













