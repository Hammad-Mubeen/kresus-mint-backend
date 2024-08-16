const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "urls_data",
  whitelist: (data) =>
    whitelist(data, ["id", "url_id", "data", "created_at", "updated_at"]),
};
