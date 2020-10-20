const Router = require("express").Router();
const { AgentDoc, ClientDoc } = require("../../schemas");

Router.get("/:agentid", (req, res, next) => {
  const { agentid } = req.params;
  AgentDoc.findById(agentid)
    .then((agent) => res.send(agent))
    .catch(next);
});

Router.get("/", (req, res, next) => {
  AgentDoc.find()
    .then((agents) => res.send(agents))
    .catch(next);
});

Router.post("/", (req, res, next) => {
  AgentDoc.create(req.body)
    .then((agent) => res.send(agent))
    .catch(next);
});

Router.put("/:agentid", (req, res, next) => {
  const { agentid } = req.params;
  AgentDoc.findOneAndUpdate({ _id: agentid }, req.body, { new: true })
    .then((agent) => res.send(agent))
    .catch(next);
});

Router.delete("/:agentid", (req, res, next) => {
  const { agentid } = req.params;
  const quries = [AgentDoc.findByIdAndDelete(agentid)];
  quries.push(
    ClientDoc.updateMany(
      { isAllocatedTo: agentid },
      { $set: { isAllocatedTo: "" } }
    )
  );
  Promise.all(quries)
    .then(([agent]) => res.send(agent))
    .catch(next);
});

module.exports = Router;
