const PackageService = require("../services/package.service");
const Response = require("../utils/response");

module.exports = {
  getAllPackages: function (req, res, next) {
    PackageService.getAllPackages(req)
      .then((resp) => {
        return Response.Send.Raw(res, resp.code, resp.body);
      })
      .catch((err) => {
        next(err);
      });
  },
};
