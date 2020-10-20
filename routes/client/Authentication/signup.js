const Router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { ClientDoc } = require("../../../schemas");

Router.post("/", (req, res, next) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  ClientDoc.create({ ...req.body, password: hash })
    .then((client) => {
      const token = jwt.sign({ ...client }, process.env.SALT);
      res.send({ token });
    })
    .catch((err) => {
      if (err.code === 11000)
        return res.status(401).send({ err: "Email is already registered." });
      next(err, req, res);
    });
});

module.exports = Router;
