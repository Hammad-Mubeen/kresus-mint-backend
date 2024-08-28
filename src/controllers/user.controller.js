const Response = require("../utils/response");
const Http = require("../utils/httpCodes");
const UserService = require("../services/users.service");

module.exports = {
  onboarding: function (req, res, next) {
    UserService.onboarding(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
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
    UserService.shareYourCreation(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getYourSharedCreationInfo: function (req, res) {
    UserService.getYourSharedCreationInfo(req.params.vaultAddress,req.params.nftId,req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getMintGasPrice: function (req, res) {
    UserService.getMintGasPrice(req.params.vaultAddress,req.params.ipfsHash,req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        console.log("err: ",err);
        next(err);
      });
  },
  getPriceConversion: function (req, res) {
    UserService.getPriceConversion(req.params.symbolforconversion,req.params.symboltoconvertto,req.params.amount,req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getUserWhiteListStatus: function (req, res) {
    UserService.getUserWhiteListStatus(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
