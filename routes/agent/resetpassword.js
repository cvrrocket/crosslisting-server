const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const { AgentDoc } = require("../../schemas");

Router.post("/:aid", (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  AgentDoc.findOne({ _id: req.params.aid })
    .then(async (user) => {
      //const result = await bcrypt.compare(oldPassword, user.password);
      if (oldPassword != user.password)
        return console.log("Incorrect old Password!");
      //const hash = await bcrypt.hash(newPassword, 10);
      user.password = newPassword;
      return user.save();
    })
    .then((_) => console.log("Password is successfully changed!"))
    .catch(next);
});

module.exports = Router;
