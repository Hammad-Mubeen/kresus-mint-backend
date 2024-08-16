const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "packages",
  whitelist: (data) =>
    whitelist(data, [
      "id",
      "name",
      "price",
      "credits",
      "description",
      "created_at",
      "updated_at",
    ]),
};
