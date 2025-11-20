import Joi from 'joi';

export const newsletterSubscribeSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
});













