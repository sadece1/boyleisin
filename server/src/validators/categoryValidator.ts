import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Category name must be at least 2 characters long',
    'string.max': 'Category name must not exceed 100 characters',
    'any.required': 'Category name is required',
  }),
  slug: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),
  description: Joi.string().max(500).trim().allow('', null).optional(),
  parent_id: Joi.string().uuid().allow(null, '').optional(),
  icon: Joi.string().max(50).trim().allow('', null).optional(),
  order: Joi.number().integer().min(0).optional().default(0),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  slug: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
  description: Joi.string().max(500).trim().allow('', null).optional(),
  parent_id: Joi.string().uuid().allow(null, '').optional(),
  icon: Joi.string().max(50).trim().allow('', null).optional(),
  order: Joi.number().integer().min(0).optional(),
});













