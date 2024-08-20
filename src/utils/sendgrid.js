const sgMail = require("@sendgrid/mail");
const from = process.env.SENDGRID_FROM_EMAIL;
sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = {
  signupEmailVerification: async (to, templateValues) => {
    let options = {
      to: to,
      from: from,
      templateId: "d-94a3dd12448e4d26ad2c322045d377eb",
      dynamic_template_data: templateValues,
    };
    return sgMail.send(options);
  },
  forgotPassword: async (to, templateValues) => {
    let options = {
      to: to,
      from: from,
      templateId: "d-3f82ddd502914c84a941a415b4e172b0",
      dynamic_template_data: templateValues,
    };
    return sgMail.send(options);
  },
  shareYourCreation: async (to, templateValues) => {
    let options = {
      to: to,
      from: from,
      subject: "NFT shared",
      html:
        "<h4><b>Your friend have shared NFT with you.</b></h4>",
    };
    return sgMail.send(options);
  },
};
