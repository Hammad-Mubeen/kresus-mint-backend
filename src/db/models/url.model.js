const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "urls",
  whitelist: (data) =>
    whitelist(data, [
      "id",
      "queue_id",
      "user_id",
      "url",
      "rrule",
      "update_time",
      "status",
      "created_at",
      "updated_at",
    ]),
};
