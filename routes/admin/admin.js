const Router = require("express").Router();
const jwt = require("jsonwebtoken");

Router.use("/signin", require("./signin"));
Router.use("/payment", require("./payment"));
Router.use((req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(403).send({ msg: "Token not provided!" });
  jwt.verify(token, process.env.ADMINSALT, (err, admin) => {
    if (err) {
      return res.status(500).send({ msg: "Failed to authenticate token." });
    }
    req.admin = admin;
    next();
  });
});
Router.use("/clientdetails", require("./clientDetail"));
Router.use("/client", require("./client"));
Router.use("/product", require("./product"));
Router.use("/agent", require("./agent"));
Router.use("/", require("./allocate"));
Router.use("/rate", require("./rate"));
Router.use("/config", require("./config"));

module.exports = Router;
