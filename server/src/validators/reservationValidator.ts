import Joi from 'joi';

export const createReservationSchema = Joi.object({
  campsite_id: Joi.string().uuid().optional(),
  gear_ids: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .optional()
    .when('campsite_id', {
      is: Joi.exist(),
      then: Joi.forbidden(),
      otherwise: Joi.required(),
    }),
  start_date: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'date.format': 'Start date must be in ISO format',
    'any.required': 'Start date is required',
  }),
  end_date: Joi.date()
    .iso()
    .greater(Joi.ref('start_date'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
}).xor('campsite_id', 'gear_ids');

export const updateReservationSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed')
    .optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).optional(),
});













