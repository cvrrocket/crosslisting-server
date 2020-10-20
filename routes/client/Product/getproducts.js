const Router = require("express").Router();
const { ProductDoc } = require("../../../schemas");

Router.get("/:productid", (req, res, next) => {
  const { _id } = req.client._doc;
  const { productid } = req.params;
  ProductDoc.findOne(
    { userId: _id, "products._id": productid },
    { "products.$": 1 }
  )
    .then((product) => res.send(product))
    .catch(next);
});

Router.get("/", (req, res, next) => {
  const { _id } = req.client._doc;
  ProductDoc.findOne(
    { userId: _id },
    {
      products: 1,
    }
  )
    .then((products) => {
      res.send(products);
    })
    .catch(next);
});

module.exports = Router;
