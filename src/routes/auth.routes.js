const express = require("express");
const router = express.Router();

const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validations/auth.validation");

router
  .post("/signup", validate(authValidation.signup), authController.signup)
  .post("/login", validate(authValidation.login), authController.login)
  .post(
    "/email-verification/:token",
    validate(authValidation.emailVerification),
    authController.emailVerification
  )
  .post(
    "/forgot-password",
    validate(authValidation.forgotPassword),
    authController.forgotPassword
  )
  .post(
    "/reset-password/:token",
    validate(authValidation.recoverPassword),
    authController.recoverPassword
  );

module.exports = router;
