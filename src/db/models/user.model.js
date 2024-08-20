const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "users",
  whitelist: (data) =>
    whitelist(data, [
      "id",
      "first_name",
      "last_name",
      "email",
      "public_key",
      "private_key",
      "vault_address",
      "sharedNFTEmails",
      "is_white_listed",
      "is_email_verified",
      "created_at",
      "updated_at",
    ]),
};
