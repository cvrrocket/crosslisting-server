const Router = require("express").Router();
const { AgentDoc } = require("../../schemas");

Router.get("/:agentid", (req, res, next) => {
  AgentDoc.findOne({ _id: req.params.agentid })
    .then((response) => res.send(response))
    .catch(next);
});

Router.post("/:agentid", async (req, res, next) => {
  try {
    const addingfields = await AgentDoc.update(
      { _id: req.params.agentid }, //current_user_id
      { $set: { username: req.body.name, password: req.body.email } }
    );
    console.log("send");
    res.send(addingfields);
  } catch (err) {
    console.log("err");
    res.json({ message: err });
  }
});

module.exports = Router;
