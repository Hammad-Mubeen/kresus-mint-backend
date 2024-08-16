const Response = require("../utils/response");
const Http = require("../utils/httpCodes");
const UserService = require("../services/users.service");

module.exports = {
  user: function (req, res) {
    UserService.user(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  updateUser: function (req, res, next) {
    UserService.updateUser(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  updateImage: function (req, res, next) {
    UserService.updateImage(req.file, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
