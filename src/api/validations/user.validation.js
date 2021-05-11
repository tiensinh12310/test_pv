const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {

  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(0),
      size: Joi.number().min(1).max(100),
      isPagination: Joi.boolean(),
      username: Joi.string().max(128),
      status: Joi.number().valid([0,1]),
    },
  },

  // POST /v1/users
  createUser: {
    body: {
      email: Joi.string().email().required(),
      username: Joi.string().max(128),
      fullname: Joi.string(),
      avatar: Joi.string(),
      deleted: Joi.boolean(),
      status: Joi.number()
    },
  },

  // PUT /v1/users/
  updateUser: {
    body: {
      userId: Joi.number().required(),
      username: Joi.string().max(128),
      status: Joi.number(),
      deleted: Joi.boolean(),
      avatar: Joi.string(),
    },
  },
  // POST /v1/users/validate-email
  email: {
    body: {
      email: Joi.string().email().required()
    },
  },
};
