const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");
const auth = require("../middlewares/auth");

router
  .get("/getYourSharedCreationInfo/:id",userController.getYourSharedCreationInfo)
  .get("/getUserWhiteListStatus/:email",userController.getUserWhiteListStatus)
  .patch("/shareYourCreation/:id", validate(userValidation.shareYourCreation), userController.shareYourCreation)
  
module.exports = router;
