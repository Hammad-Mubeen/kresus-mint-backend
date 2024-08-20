const Response = require("../utils/response");
const Http = require("../utils/httpCodes");
const UserService = require("../services/users.service");

module.exports = {
  mintNFT: function (req, res, next) {
    UserService.mintNFT(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  shareYourCreation: function (req, res, next) {
    UserService.shareYourCreation(req.body, req.params.id)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getYourSharedCreationInfo: function (req, res) {
    UserService.getYourSharedCreationInfo(req.params.id)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getUserWhiteListStatus: function (req, res) {
    UserService.getUserWhiteListStatus(req.params.email)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
