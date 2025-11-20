import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Generic validation middleware
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true, // Enable automatic type conversion
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
      return;
    }

    req.body = value;
    next();
  });
};

/**
 * Query validation middleware
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true, // Enable automatic type conversion (e.g., string "1" to number 1)
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors,
      });
      return;
    }

    req.query = value as any;
    next();
  });
};

// Export all validators
export * from './userValidator';
export * from './campsiteValidator';
export * from './gearValidator';
export * from './blogValidator';
export * from './reservationValidator';
export * from './reviewValidator';
export * from './categoryValidator';
export * from './contactValidator';
export * from './appointmentValidator';
export * from './newsletterValidator';
