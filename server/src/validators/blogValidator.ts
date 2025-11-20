import Joi from 'joi';

export const createBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).trim().required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  excerpt: Joi.string().min(20).max(500).trim().required().messages({
    'string.min': 'Excerpt must be at least 20 characters long',
    'string.max': 'Excerpt must not exceed 500 characters',
    'any.required': 'Excerpt is required',
  }),
  content: Joi.string().min(100).required().messages({
    'string.min': 'Content must be at least 100 characters long',
    'any.required': 'Content is required',
  }),
  author: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Author name must be at least 2 characters long',
    'string.max': 'Author name must not exceed 100 characters',
    'any.required': 'Author is required',
  }),
  author_avatar: Joi.string().uri().optional(),
  category: Joi.string().min(2).max(100).trim().required().messages({
    'string.min': 'Category must be at least 2 characters long',
    'string.max': 'Category must not exceed 100 characters',
    'any.required': 'Category is required',
  }),
  image: Joi.string().uri().required().messages({
    'string.uri': 'Image must be a valid URL',
    'any.required': 'Image is required',
  }),
  read_time: Joi.number().integer().min(1).required().messages({
    'number.min': 'Read time must be at least 1 minute',
    'any.required': 'Read time is required',
  }),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  featured: Joi.boolean().optional().default(false),
  recommended_posts: Joi.array().items(Joi.string().uuid()).max(4).optional(),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).trim().optional(),
  excerpt: Joi.string().min(20).max(500).trim().optional(),
  content: Joi.string().min(100).optional(),
  author: Joi.string().min(2).max(100).trim().optional(),
  author_avatar: Joi.string().uri().optional(),
  category: Joi.string().min(2).max(100).trim().optional(),
  image: Joi.string().uri().optional(),
  read_time: Joi.number().integer().min(1).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  featured: Joi.boolean().optional(),
  recommended_posts: Joi.array().items(Joi.string().uuid()).max(4).optional(),
});

export const blogFiltersSchema = Joi.object({
  search: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  featured: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});













