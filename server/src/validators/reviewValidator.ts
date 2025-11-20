import Joi from 'joi';

export const createReviewSchema = Joi.object({
  campsite_id: Joi.string().uuid().optional(),
  gear_id: Joi.string().uuid().optional(),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must not exceed 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().min(10).max(1000).trim().required().messages({
    'string.min': 'Comment must be at least 10 characters long',
    'string.max': 'Comment must not exceed 1000 characters',
    'any.required': 'Comment is required',
  }),
}).xor('campsite_id', 'gear_id');

export const updateReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().min(10).max(1000).trim().optional(),
});













