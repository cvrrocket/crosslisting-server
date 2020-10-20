const Router = require("express").Router();

Router.use("/", require("./getproducts"));
Router.use("/", require("./addproduct"));
Router.use("/", require("./updateproduct"));
Router.use("/", require("./deleteproduct"));

module.exports = Router;
