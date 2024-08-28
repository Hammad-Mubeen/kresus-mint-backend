const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");
const auth = require("../middlewares/auth");

router

  .get("/getMintGasPrice/:vaultAddress/:ipfsHash", auth, userController.getMintGasPrice)
  .get("/getPriceConversion/:symbolforconversion/:symboltoconvertto/:amount", auth, userController.getPriceConversion)
  .get("/getYourSharedCreationInfo/:vaultAddress/:nftId", auth, userController.getYourSharedCreationInfo)
  .get("/getUserWhiteListStatus", auth, userController.getUserWhiteListStatus)
  .post("/onboarding", validate(userValidation.onboarding), userController.onboarding)
  .post("/mintNFT", [auth, validate(userValidation.mintNFT)], userController.mintNFT)
  .patch("/shareYourCreation", [auth, validate(userValidation.shareYourCreation)], userController.shareYourCreation);

module.exports = router;
