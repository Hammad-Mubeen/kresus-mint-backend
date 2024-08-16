const Joi = require("joi");

module.exports = {
  signup: {
    body: Joi.object({
      first_name: Joi.string().min(3).max(255).required(),
      last_name: Joi.string().min(3).max(255).required(),
      email: Joi.string().email().max(127).required(),
      password: Joi.string().min(6).required(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
  emailVerification: {
    params: Joi.object({
      token: Joi.string().required(),
    }),
    body: Joi.object({
      code: Joi.string().length(6).required(),
    }),
  },
  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },
  recoverPassword: {
    params: Joi.object({
      token: Joi.string().required(),
    }),
    body: Joi.object({
      code: Joi.string().length(6).required(),
      password: Joi.string().min(6).required(),
    }),
  },
};
