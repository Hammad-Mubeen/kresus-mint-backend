const Joi = require("joi");

module.exports = {
  updateUser: {
    body: Joi.object({
      firstName: Joi.string().min(3).max(255).required(),
      lastName: Joi.string().min(3).max(255).required(),
    }),
  },
};
