import Joi from 'joi';

export const errorSchema = Joi.object({
  message: Joi.string().required(),
  error: Joi.string().optional(),
  statusCode: Joi.number().integer().optional()
}).unknown(true);

export const paginationSchema = Joi.object({
  total: Joi.number().integer().min(0).required(),
  skip: Joi.number().integer().min(0).required(),
  limit: Joi.number().integer().min(1).required()
});

const isoDateString = Joi.string().pattern(/^\d{4}-\d{1,2}-\d{1,2}$/);
const isoDateTimeString = Joi.string().isoDate();

export const dateSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  birthDate: isoDateString.required(),  // ← Validate format
  // ... other fields
  createdAt: isoDateTimeString.optional(),  // ← If your API has timestamps
  updatedAt: isoDateTimeString.optional()
}).unknown(true);