const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const { ClientDoc } = require("../../../schemas");

Router.post("/", (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { email } = req.client._doc;
  ClientDoc.findOne({ email })
    .then(async (user) => {
      const result = await bcrypt.compare(oldPassword, user.password);
      if (!result) return console.log("Incorrect old Password!");
      const hash = await bcrypt.hash(newPassword, 10);
      user.password = hash;
      return user.save();
    })
    .then((_) => console.log("Password is successfully changed!"))
    .catch(next);
});

module.exports = Router;
