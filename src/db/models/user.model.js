const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "users",
  whitelist: (data) =>
    whitelist(data, [
      "vaultAddress",
      "is_white_listed"
    ]),
};
