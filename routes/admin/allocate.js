const Router = require("express").Router();
const { ClientDoc, AgentDoc } = require("../../schemas");

Router.get("/pendingallocation", (req, res, next) => {
  ClientDoc.find({})
    .then((client) => res.send(client))
    .catch(next);
});

Router.get("/allocated/:agentid", (req, res, next) => {
  const { agentid } = req.params;

  ClientDoc.find({ isAllocatedTo: agentid })
    .then((clients) => res.send(clients))
    .catch(next);
});

Router.post("/allocate/", (req, res, next) => {
  const { agentid, clientid } = req.body;
  ClientDoc.findByIdAndUpdate(
    clientid,
    { $set: { isAllocatedTo: agentid } },
    { new: true }
  )
    .then((client) => {
      AgentDoc.findOne({ _id: agentid }, { noOfClients: 1 })
        .then((count) => {
          console.log(count);
          AgentDoc.findByIdAndUpdate(agentid, {
            $set: { noOfClients: count.noOfClients + 1 },
          }).catch(next);
        })
        .catch(next);
      res.send(client);
    })
    .catch(next);
});

Router.delete("/deallocate/:clientid", (req, res, next) => {
  const { clientid } = req.params;
  const agentid = req.headers.agentid;
  ClientDoc.findByIdAndUpdate(
    clientid,
    { $set: { isAllocatedTo: "" } },
    { new: true }
  )
    .then((client) => {
      AgentDoc.findOne({ _id: agentid }, { noOfClients: 1 })
        .then((count) => {
          console.log(count);
          AgentDoc.findByIdAndUpdate(agentid, {
            $set: { noOfClients: count.noOfClients - 1 },
          }).catch(next);
        })
        .catch(next);
      res.send(client);
    })
    .catch(next);
});

module.exports = Router;
