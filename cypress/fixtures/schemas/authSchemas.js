import Joi from 'joi';

export const loginResponseSchema = Joi.object({
  id: Joi.number().integer().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  gender: Joi.string().required(),
  image: Joi.string().uri().required(),
  accessToken: Joi.string().required(),
  refreshToken: Joi.string().required()
}).unknown(true);

export const errorResponseSchema = Joi.object({
  message: Joi.string().required()
}).unknown(true);