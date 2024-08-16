const SnifferService = require("../services/sniffer.service");
const Response = require("../utils/response");

module.exports = {
  addUrls: function (req, res, next) {
    SnifferService.addUrls(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getSniffedData: function (req, res, next) {
    SnifferService.getSniffedData(req.params, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getUsersUrls: function (req, res, next) {
    SnifferService.getUsersUrls(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  deleteQueue: function (req, res, next) {
    SnifferService.deleteQueue(req.params, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
  getQueueStatus: function (req, res, next) {
    SnifferService.getQueueStatus(req.body, req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
