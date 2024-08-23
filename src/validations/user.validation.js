const Joi = require("joi");
const { mintNFT } = require("../services/users.service");

module.exports = {
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
      vaultAddress: Joi.string().required()
    }),
  }
};
