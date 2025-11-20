import Joi from 'joi';

export const appointmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().min(10).max(20).trim().required(),
  date: Joi.date().iso().required(),
  time: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
  service_type: Joi.string().max(100).trim().optional(),
  message: Joi.string().max(1000).trim().optional(),
});













