const whitelist = require("../../utils/whitelist");

module.exports = {
  table: "nfts",
  whitelist: (data) =>
    whitelist(data, [
      "vaultAddress",
      "nftId",
      "name",
      "description",
      "nftURL",
      "sharedNFTEmails"
    ]),
};
