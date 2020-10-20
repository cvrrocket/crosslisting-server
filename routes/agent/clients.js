const Router = require("express").Router();
const { ClientDoc, PasswordDoc } = require("../../schemas");

Router.get("/allocated/:agentid", (req, res, next) => {
  const { agentid } = req.params;

  ClientDoc.find({ isAllocatedTo: agentid })
    .then((clients) => res.send(clients))
    .catch(next);
});

Router.get("/:clientid", (req, res, next) => {
  const { clientid } = req.params;

  ClientDoc.findOne({ _id: clientid })
    .then((clients) => res.send(clients))
    .catch(next);
});

Router.get("/password/:clientid", (req, res, next) => {
  const { clientid } = req.params;
  PasswordDoc.findOne({ userId: clientid })
    .then((password) => res.send(password))
    .catch(next);
});

Router.get("/getstatus/:cid", (req, res, next) => {
  //const { _id } = req.client._doc;
  const { cid } = req.params;
  PasswordDoc.findOne({ userId: cid }).then((data) => {
    const marketplaces = {};
    for (var i = 0; i < data.passwords.length; i++) {
      marketplaces[`${data.passwords[i].website}`] = true;
    }
    res.send(marketplaces);
  });
});

Router.get("/getstatus/others/:cid", (req, res, next) => {
  //const { _id } = req.client._doc;
  const { cid } = req.params;
  PasswordDoc.findOne({ userId: cid }).then((data) => {
    const others = [];
    data.passwords.map((d, i) => {
      if (
        d.website != "Ebay" &&
        d.website != "Poshmark" &&
        d.website != "Mercari"
      ) {
        others.push(d.website);
      }
    });
    //console.log(others);
    res.send(others);
  });
});

module.exports = Router;
