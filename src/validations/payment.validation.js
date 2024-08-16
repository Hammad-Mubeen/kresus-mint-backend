const Joi = require("joi");

module.exports = {
  createCheckoutSession: {
    body: Joi.object({
      package_id: Joi.string().uuid().required(),
    }),
  },
};
