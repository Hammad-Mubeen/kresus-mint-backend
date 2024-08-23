const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");
const auth = require("../middlewares/auth");

router
  .post("/mintNFT", validate(userValidation.mintNFT), userController.mintNFT)
  .get("/getYourSharedCreationInfo/:vaultAddress/:nftId",userController.getYourSharedCreationInfo)
  .get("/getUserWhiteListStatus/:vaultAddress",userController.getUserWhiteListStatus)
  .patch("/shareYourCreation", validate(userValidation.shareYourCreation), userController.shareYourCreation);

module.exports = router;
