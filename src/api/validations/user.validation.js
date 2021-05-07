const Joi = require('joi');
const User = require('../models/user.model');

module.exports = {

  // GET /v1/users
  listUsers: {
    query: {
      page: Joi.number().min(1),
      size: Joi.number().min(1).max(100),
      isPagination: Joi.boolean().required(),
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
      deleted: Joi.number(),
      status: Joi.number()
    },
  },

  // PUT /v1/users/:userId
  updateUser: {
    body: {
      userId: Joi.number().required(),
      username: Joi.string().max(128),
      status: Joi.number().valid([0,1]),
      deleted: Joi.number(),
      avatar: Joi.string(),
    },
  },
};
