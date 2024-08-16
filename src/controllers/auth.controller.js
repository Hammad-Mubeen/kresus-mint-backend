const AuthService = require("../services/auth.service");
const Response = require("../utils/response");

module.exports = {
  signup: function (req, res, next) {
    AuthService.signup(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  login: function (req, res, next) {
    AuthService.login(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  emailVerification: function (req, res, next) {
    AuthService.emailVerification(req.params, req.body)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  forgotPassword: function (req, res, next) {
    AuthService.forgotPassword(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  recoverPassword: function (req, res, next) {
    AuthService.recoverPassword(req.params, req.body)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
