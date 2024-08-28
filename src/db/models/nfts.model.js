const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "nfts",
  whitelist: (data) =>
    whitelist(data, [
      "email",
      "vaultAddress",
      "nftId",
      "name",
      "description",
      "nftURL",
      "sharedNFTEmails"
    ]),
};
