const Joi = require('joi');

module.exports = {
    // POST /v1/auth/register
    register: {
        body: {
            username: Joi.string().required(),
            password: Joi.string().required().min(6).max(128),
        },
    },

    // POST /v1/auth/login
    login: {
        body: {
            email: Joi.string().email().required(),
            password: Joi.string().required().max(128),
        },
    },

    // POST /v1/auth/refresh
    refresh: {
        body: {
            email: Joi.string().required(),
            refresh_token: Joi.string().required(),
        },
    },
};
