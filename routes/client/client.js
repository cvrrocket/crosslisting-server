const Router = require("express").Router();
const jwt = require("jsonwebtoken");

Router.use("/signup", require("./Authentication/signup"));
Router.use("/signin", require("./Authentication/signin"));
Router.use("/forgotpassword", require("./Authentication/forgotpassword"));

// Token verification
Router.use((req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(403).send({ msg: "Token not provided!" });
  jwt.verify(token, process.env.SALT, (err, client) => {
    if (err) {
      return res.status(500).send({ msg: "Failed to authenticate token." });
    }
    req.client = client;
    next();
  });
});
Router.use("/clientdetails", require("./clientDetail"));
Router.use("/resetpassword", require("./Authentication/resetpassword"));
Router.use("/template", require("./template"));
Router.use("/product", require("./Product/product"));
Router.use("/password", require("./password"));
Router.use("/payment", require("./payment"));
module.exports = Router;
