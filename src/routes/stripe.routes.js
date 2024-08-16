const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");

const validate = require("../middlewares/validate");
const StripeController = require("../controllers/payment.controller");
const StripeValidation = require("../validations/payment.validation");

router.post(
  "/",
  [auth, validate(StripeValidation.createCheckoutSession)],
  StripeController.createCheckoutSession
);

router.post("/webhook", express.raw({ type: "*/*" }), StripeController.webhook);

module.exports = router;
