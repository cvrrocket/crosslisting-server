const Router = require("express").Router();
const { ConfigDoc } = require("../../schemas");

Router.post("/", (req, res, next) => {
  console.log(req.body);
  ConfigDoc.findOneAndUpdate(
    {},
    { $push: { Configs: req.body } },
    { new: true, upsert: true }
  )
    .then((response) => res.send(response))
    .catch(next);
});

Router.get("/", (req, res, next) => {
  ConfigDoc.find()
    .then((response) => res.send(response))
    .catch(next);
});

module.exports = Router;
