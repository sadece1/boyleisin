import Joi from 'joi';

export const createCampsiteSchema = Joi.object({
  name: Joi.string().min(5).max(200).trim().required().messages({
    'string.min': 'Campsite name must be at least 5 characters long',
    'string.max': 'Campsite name must not exceed 200 characters',
    'any.required': 'Campsite name is required',
  }),
  description: Joi.string().min(20).max(5000).trim().required().messages({
    'string.min': 'Description must be at least 20 characters long',
    'string.max': 'Description must not exceed 5000 characters',
    'any.required': 'Description is required',
  }),
  location_address: Joi.string().min(5).max(255).trim().required().messages({
    'string.min': 'Address must be at least 5 characters long',
    'string.max': 'Address must not exceed 255 characters',
    'any.required': 'Address is required',
  }),
  location_city: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City must not exceed 100 characters',
    'any.required': 'City is required',
  }),
  location_region: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Region must be at least 2 characters long',
    'string.max': 'Region must not exceed 100 characters',
    'any.required': 'Region is required',
  }),
  location_lat: Joi.number().min(-90).max(90).optional(),
  location_lng: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  rules: Joi.array().items(Joi.string()).optional(),
  capacity: Joi.number().integer().min(1).max(100).required().messages({
    'number.min': 'Capacity must be at least 1',
    'number.max': 'Capacity must not exceed 100',
    'any.required': 'Capacity is required',
  }),
  price_per_night: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price per night is required',
  }),
  available: Joi.boolean().optional().default(true),
});

export const updateCampsiteSchema = Joi.object({
  name: Joi.string().min(5).max(200).trim().optional(),
  description: Joi.string().min(20).max(5000).trim().optional(),
  location_address: Joi.string().min(5).max(255).trim().optional(),
  location_city: Joi.string().min(2).max(100).trim().optional(),
  location_region: Joi.string().min(2).max(100).trim().optional(),
  location_lat: Joi.number().min(-90).max(90).optional(),
  location_lng: Joi.number().min(-180).max(180).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  rules: Joi.array().items(Joi.string()).optional(),
  capacity: Joi.number().integer().min(1).max(100).optional(),
  price_per_night: Joi.number().positive().precision(2).optional(),
  available: Joi.boolean().optional(),
});

export const campsiteFiltersSchema = Joi.object({
  search: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  region: Joi.string().trim().optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  available: Joi.boolean().optional(),
  minRating: Joi.number().min(0).max(5).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});













