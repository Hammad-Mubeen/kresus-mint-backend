const Joi = require("joi");
const { mintNFT } = require("../services/users.service");

module.exports = {
  onboarding: {
    body: Joi.object({
      token: Joi.string().required()
    }),
  },
  shareYourCreation: {
    body: Joi.object({
      vaultAddress : Joi.string().required(),
      nftId: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      nftURL: Joi.string().required(),
      emails: Joi.array().items(Joi.string().email().max(127).required()),
    }),
  },
  mintNFT: {
    body: Joi.object({
      ipfsHash: Joi.string().required(),
      vaultAddress: Joi.string().required(),
      params: Joi.object().required()
    }),
  }
};
