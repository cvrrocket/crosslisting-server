const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  //host: "smtp.gmail.com",
  service: "Gmail",
  secure: true,
  auth: {
    user: "hammockdata",
    pass: "HammockData123",
  },
});

module.exports = (customOptions) =>
  new Promise((resolve, reject) => {
    const mailOptions = {
      from: "Edunomics Teams",
      ...customOptions,
    };

    transporter.sendMail(mailOptions, (err) => (err ? reject(err) : resolve()));
  });
