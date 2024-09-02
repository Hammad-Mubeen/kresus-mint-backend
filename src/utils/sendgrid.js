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
    let templateValues = {
      OriginalMinter :  vaultAddress,
      NFTId :  nftId,
      Name : name ,
      Description :  description,
      URL :  nftURL
    }
    let options = {
      to: to,
      from: from,
      subject: "An NFT has been shared with you",
      templateId: "d-6dc0a531ebf5472c9618b0a9846c6ad4",
      dynamic_template_data: templateValues
    };
    return sgMail.send(options);
  },
};
