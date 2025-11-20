import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  subject: Joi.string().min(5).max(200).trim().required(),
  message: Joi.string().min(10).max(2000).trim().required(),
});













