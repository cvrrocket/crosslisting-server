const Router = require("express").Router();
const { ClientDoc, PasswordDoc } = require("../../schemas");

Router.get("/", (req, res, next) => {
  ClientDoc.find({})
    .then((clients) => res.send(clients))
    .catch(next);
});

Router.get("/:clientid", (req, res, next) => {
  const { clientid } = req.params;

  ClientDoc.find({ _id: clientid })
    .then((clients) => res.send(clients))
    .catch(next);
});

Router.get("/password/:clientid", (req, res, next) => {
  const { clientid } = req.params;
  PasswordDoc.findOne({ userId: clientid })
    .then((password) => res.send(password))
    .catch(next);
});

module.exports = Router;
