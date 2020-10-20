const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { ClientDoc } = require("../../../schemas");

Router.get("/", (req, res, next) => {
  const { email, password } = req.query;
  if (!email || !password)
    return res.send({ err: "Email and password both are required." });

  ClientDoc.findOne({ email })
    .then((client) => {
      if (!client) return res.send({ err: "Incorrect Email ID" });

      const result = bcrypt.compareSync(password, client.password);
      if (!result) return res.send({ err: "Incorrect password" });

      const token = jwt.sign({ ...client }, process.env.SALT);
      res.send({ token });
    })
    .catch(next);
});

module.exports = Router;
