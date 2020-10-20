const Router = require("express").Router();
const { AgentDoc, ClientDoc } = require("../../schemas");

Router.use("/resetpassword", require("./resetpassword"));
Router.use("/agentdetail", require("./agentDetail"));
Router.use("/agent", require("./agents"));
Router.use("/client", require("./clients"));
Router.use("/payment", require("./payment"));
Router.use("/product", require("./product"));
Router.use("/template", require("./template"));

module.exports = Router;
