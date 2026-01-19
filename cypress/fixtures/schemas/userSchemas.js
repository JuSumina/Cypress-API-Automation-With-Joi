import Joi from 'joi';


// Individual user schema
export const userSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  maidenName: Joi.string().allow(''),
  age: Joi.number().integer().min(0).required(),
  gender: Joi.string().valid('male', 'female').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  birthDate: Joi.string().required(),
  image: Joi.string().uri().required(),
  bloodGroup: Joi.string().required(),
  height: Joi.number().required(),
  weight: Joi.number().required(),
  eyeColor: Joi.string().required(),
  hair: Joi.object({
    color: Joi.string().required(),
    type: Joi.string().required()
  }).required(),
  ip: Joi.string().ip().required(),
  address: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    stateCode: Joi.string().optional(),
    postalCode: Joi.string().required(),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    country: Joi.string().optional()
  }).required(),
  macAddress: Joi.string().required(),
  university: Joi.string().required(),
  bank: Joi.object({
    cardExpire: Joi.string().required(),
    cardNumber: Joi.string().required(),
    cardType: Joi.string().required(),
    currency: Joi.string().required(),
    iban: Joi.string().required()
  }).required(),
  company: Joi.object({
    department: Joi.string().required(),
    name: Joi.string().required(),
    title: Joi.string().required(),
    address: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      stateCode: Joi.string().optional(),
      postalCode: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required(),
      country: Joi.string().optional()
    }).required()
  }).required(),
  ein: Joi.string().required(),
  ssn: Joi.string().required(),
  userAgent: Joi.string().required(),
  crypto: Joi.object({
    coin: Joi.string().required(),
    wallet: Joi.string().required(),
    network: Joi.string().required()
  }).optional(),
  role: Joi.string().valid('admin', 'moderator', 'user').optional()
}).unknown(true);

// Array of users
export const usersArraySchema = Joi.object({
  users: Joi.array().items(userSchema).required(),
  total: Joi.number().integer().min(0).required(),
  skip: Joi.number().integer().min(0).required(),
  limit: Joi.number().integer().min(0).required()
});

// Single user response
export const singleUserSchema = userSchema;

// Simplified user schema for listing (less strict)
export const userListItemSchema = Joi.object({
  id: Joi.number().integer().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.number().integer().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  username: Joi.string().required()
}).unknown(true);

export const userListSchema = Joi.object({
  users: Joi.array().items(userListItemSchema).required(),
  total: Joi.number().integer().required(),
  skip: Joi.number().integer().required(),
  limit: Joi.number().integer().required()
});