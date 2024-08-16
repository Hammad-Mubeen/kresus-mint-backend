const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "users",
  whitelist: (data) =>
    whitelist(data, [
      "id",
      "first_name",
      "last_name",
      "email",
      "image_url",
      "user_credits",
      "is_email_verified",
      "stripe_customer_id",
      "created_at",
      "updated_at",
    ]),
};
