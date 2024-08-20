const Joi = require("joi");

module.exports = {
  shareYourCreation: {
    body: Joi.object({
      emails: Joi.array().items(Joi.string().email().max(127).required())
    }),
  }
};
