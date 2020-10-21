const Router = require("express").Router();
const { AgentDoc, ClientDoc } = require("../../schemas");

Router.use("/resetpasswordofuser", require("./resetpassword"));
Router.use("/agentdetail", require("./agentDetail"));
Router.use("/agent", require("./agents"));
Router.use("/client", require("./clients"));
Router.use("/payment", require("./payment"));
Router.use("/product", require("./product"));
Router.use("/templates", require("./template"));

module.exports = Router;
