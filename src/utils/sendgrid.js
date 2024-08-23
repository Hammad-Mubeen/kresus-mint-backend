const sgMail = require("@sendgrid/mail");
const from = process.env.SENDGRID_FROM_EMAIL;
sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = {
  shareYourCreation: async (
    to,
    vaultAddress,
    nftId,
    name,
    description,
    nftURL) => {
    let options = {
      to: to,
      from: from,
      subject: "Someone has shared their nft with you",
      html:
      "<h4><b>Shared NFT Details: </b></h4>" +
      "/n Original Minter : " + vaultAddress +
      "/n NFTId : " + nftId +
      "/n Name : " + name +
      "/n Description : " + description +
      "/n URL : " + nftURL
    };
    return sgMail.send(options);
  },
};
