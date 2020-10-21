const Router = require("express").Router();
const { ClientDoc, TransactionDoc, RateDoc } = require("../../schemas/index");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

Router.get("/rates/:userid", (req, res, next) => {
  RateDoc.find()
    .then((rates) => res.send(rates[0].Rates))
    .catch(next);
});

module.exports = Router;
