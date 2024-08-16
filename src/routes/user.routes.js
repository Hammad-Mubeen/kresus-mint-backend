const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");

const userController = require("../controllers/user.controller");
const userValidation = require("../validations/user.validation");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");

router
  .get("/", auth, userController.user)
  .patch("/image", [auth, multer.singleFile("profile")], userController.updateImage)
  .patch("/:id", [auth, validate(userValidation.updateUser)], userController.updateUser);

module.exports = router;
