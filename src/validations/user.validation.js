const Joi = require("joi");
const { mintNFT } = require("../services/users.service");

module.exports = {
  shareYourCreation: {
    body: Joi.object({
      emails: Joi.array().items(Joi.string().email().max(127).required())
    }),
  },
  mintNFT: {
    body: Joi.object({
      ifpsHash: Joi.string().required()
    }),
  }
};
