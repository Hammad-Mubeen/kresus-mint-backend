const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "sites_trackers",
  whitelist: (data) => whitelist(data, ["id", "url_id", "site", "trackers"]),
};
