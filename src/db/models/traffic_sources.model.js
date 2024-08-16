const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "traffic_sources",
  whitelist: (data) =>
    whitelist(data, ["id", "url_id", "traffic_sources_data", "created_at", "updated_at"]),
};
