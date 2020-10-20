const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AdminDoc } = require("../../schemas");

Router.get("/", (req, res, next) => {
  const { username, password } = req.query;

  AdminDoc.findOne({ username })
    .then((admin) => {
      if (!admin) return res.send({ err: "Username is incorrect." });
      const result = bcrypt.compareSync(password, admin.password);
      if (!result) return res.send({ err: "Password is incorrect" });

      const token = jwt.sign({ ...username }, process.env.ADMINSALT);
      res.send({ token });
    })
    .catch(next);
});

module.exports = Router;
