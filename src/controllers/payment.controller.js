const Response = require("../utils/response");
const PaymentService = require("../services/payment.service");

module.exports = {
  createCheckoutSession: function (req, res, next) {
    PaymentService.createCheckoutSession(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  webhook: function (req, res, next) {
    PaymentService.webhook(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getPurchasingHistory: function (req, res, next) {
    PaymentService.getPurchasingHistory(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
