const Router = require("express").Router();
const { ProductDoc } = require("../../schemas");

Router.get("/:userid", (req, res, next) => {
  const { userid } = req.params;
  ProductDoc.findOne({ userId: userid })
    .then((products) => res.send(products))
    .catch(next);
});

Router.get("/:userid/:productid", (req, res, next) => {
  const { userid, productid } = req.params;
  ProductDoc.findOne(
    { userId: userid, "products._id": productid },
    { "products.$": 1 }
  )
    .then((product) => res.send(product))
    .catch(next);
});

module.exports = Router;
