const Router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendMail } = require("../../../utils");
const { ClientDoc } = require("../../../schemas");

Router.get("/:email", (req, res, next) => {
  const { email } = req.params;
  console.log(email);
  if (!email) return res.send({ msg: "Email not provided!" });

  ClientDoc.findOne({ email: email })
    .then(async (user) => {
      // Validate Email
      if (!user)
        return res.status(404).send({ err: `${email} is not registered.` });

      // Generate and set 6 digit Verification Code
      user.forgotPasswordCode = Math.floor(
        Math.random() * (999999 - 100000) + 100000
      );

      // Set Expiry date of 1 day. (8.64e7 are milliseconds in one day)
      user.forgotPasswordExp = Date.now() + 8.64e7;

      const mailOptions = {
        subject: "Please reset your password",
        to: user.email,
        html: `
          <p>We heard that you lost your password. Sorry about that!</p>
          <p>But don’t worry! You can use the following code to reset your password:</p>
          Reset Password Code: ${user.forgotPasswordCode}
          <p>If you did not request this, please ignore this email and your password will remain unchanged.\n</p>
          
          <p>Thanks, <br/>
          The Edunomics Team</p>
        `,
      };

      // Sent Email with the token as params
      await sendMail(mailOptions);

      //  Update user in DB.
      return user.save();
    })
    .then((_) => {
      res.send({ data: "Link to reset password has been sent", assert: true });
      console.log("email sent");
    })
    .catch(next);
});

Router.get("/confirmCode/:code/:email", (req, res, next) => {
  const { code, email } = req.params;

  if (!code || !email) return res.send("Code and email is required!");

  ClientDoc.findOne({ email })
    .then(async (user) => {
      if (!user) return res.send({ err: "Invalid Email address" });
      const { forgotPasswordExp, forgotPasswordCode } = user;

      // Validate expiry date
      if (!forgotPasswordExp || forgotPasswordExp < Date.now())
        return res.send({ err: "Token Expired" });

      //  Validate Token
      if (!forgotPasswordCode || forgotPasswordCode !== code)
        return res.send({ err: "Invalid Verification Code" });

      // Reset token and expiry date.
      user.forgotPasswordCode = "";
      user.forgotPasswordExp = Date.now();

      // Update user in DB
      await user.save();

      const token = jwt.sign({ ...user }, process.env.SALT);
      console.log("code confirmed");
      res.send({ token: token, assert: true });
    })
    .catch(next);
});

Router.post("/update", async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.send("Token not provided");

  //jwt.verify(token, process.env.SALT, async (err, user) => {
  // if (err) {
  //   return res.status(500).send({ msg: "Failed to authenticate token." });
  // }
  const { email } = req.body;
  const { newPassword } = req.body;
  const hash = await bcrypt.hash(newPassword, 10);

  ClientDoc.findOneAndUpdate({ email }, { password: hash }, { new: true })
    .then((dbres) => {
      if (!dbres)
        return res.send("Something went wrong while updating password.");
      res.send({ data: "Password reset successfull.", assert: true });
    })
    .catch(next);
  //});
});

module.exports = Router;
