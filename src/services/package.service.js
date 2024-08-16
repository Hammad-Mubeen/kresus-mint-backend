const DB = require("../db");
const PackageModel = require("../db/models/package.model");
const HTTP = require("../utils/httpCodes");
const Logger = require("../utils/logger");

module.exports = {
  getAllPackages: async () => {
    try {
      const packages = await DB.select("*")
        .from(PackageModel.table)
        .orderBy("price", "asc");
      return {
        code: HTTP.Success,
        body: PackageModel.whitelist(packages),
      };
    } catch (err) {
      Logger.error("package.service -> getAllPackages \n", err);
      throw err;
    }
  },
};
