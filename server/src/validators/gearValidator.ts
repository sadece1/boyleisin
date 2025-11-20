import Joi from 'joi';

export const createGearSchema = Joi.object({
  name: Joi.string().min(3).max(200).trim().required().messages({
    'string.min': 'Gear name must be at least 3 characters long',
    'string.max': 'Gear name must not exceed 200 characters',
    'any.required': 'Gear name is required',
  }),
  description: Joi.string().min(20).max(2000).trim().required().messages({
    'string.min': 'Description must be at least 20 characters long',
    'string.max': 'Description must not exceed 2000 characters',
    'any.required': 'Description is required',
  }),
  category_id: Joi.string().uuid().required().messages({
    'string.guid': 'Category ID must be a valid UUID',
    'any.required': 'Category ID is required',
  }),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional(),
  price_per_day: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price per day is required',
  }),
  deposit: Joi.number().positive().precision(2).optional(),
  status: Joi.string()
    .valid('for-sale', 'sold', 'orderable')
    .required()
    .messages({
      'any.only': 'Status must be one of: for-sale, sold, orderable',
      'any.required': 'Status is required',
    }),
  specifications: Joi.object().optional(),
  brand: Joi.string().max(100).trim().optional(),
  color: Joi.string().max(50).trim().optional(),
  available: Joi.boolean().optional().default(true),
  recommended_products: Joi.array().items(Joi.string().uuid()).max(4).optional(),
});

export const updateGearSchema = Joi.object({
  name: Joi.string().min(3).max(200).trim().optional(),
  description: Joi.string().min(20).max(2000).trim().optional(),
  category_id: Joi.string().uuid().optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional(),
  price_per_day: Joi.number().positive().precision(2).optional(),
  deposit: Joi.number().positive().precision(2).optional(),
  status: Joi.string().valid('for-sale', 'sold', 'orderable').optional(),
  specifications: Joi.object().optional(),
  brand: Joi.string().max(100).trim().optional(),
  color: Joi.string().max(50).trim().optional(),
  available: Joi.boolean().optional(),
  recommended_products: Joi.array().items(Joi.string().uuid()).max(4).optional(),
});

export const gearFiltersSchema = Joi.object({
  search: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  available: Joi.boolean().optional(),
  brand: Joi.string().trim().optional(),
  color: Joi.string().trim().optional(),
  status: Joi.string().valid('for-sale', 'sold', 'orderable').optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  sortBy: Joi.string()
    .valid('price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest', 'oldest')
    .optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});













