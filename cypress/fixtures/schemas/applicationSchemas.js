import Joi from 'joi';

// Minimal "create application" payload schema
export const createApplicationRequestSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  dateOfBirth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  ssn: Joi.string().pattern(/^\d{9}$/).required(),                   // 9 digits
  applicantId: Joi.string().pattern(/^\d{9}$/).required(),           // 9 digits
  benefit: Joi.string().min(1).required(),
}).unknown(true);

// Minimal "created application" response schema (what API returns)
export const createApplicationResponseSchema = Joi.object({
  id: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  applicationId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),
  appId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).optional(),

  status: Joi.string().optional(),
  message: Joi.string().optional(),
}).unknown(true);

// Generic error schema (works for JSON error bodies)
export const errorSchema = Joi.object({
  message: Joi.string().required()
}).unknown(true);