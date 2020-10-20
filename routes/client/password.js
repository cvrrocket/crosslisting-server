const Router = require("express").Router();
const { PasswordDoc } = require("../../schemas");

Router.get("/", (req, res, next) => {
  const { _id } = req.client._doc;
  PasswordDoc.findOne({ userId: _id })
    .then((passwords) => res.send(passwords))
    .catch(next);
});

Router.get("/getstatus", (req, res, next) => {
  const { _id } = req.client._doc;
  PasswordDoc.findOne({ userId: _id }).then((data) => {
    const marketplaces = {};
    for (var i = 0; i < data.passwords.length; i++) {
      marketplaces[`${data.passwords[i].website}`] = true;
    }
    res.send(marketplaces);
  });
});

Router.get("/getstatus/others", (req, res, next) => {
  const { _id } = req.client._doc;
  PasswordDoc.findOne({ userId: _id }).then((data) => {
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

Router.post("/", (req, res, next) => {
  const { _id } = req.client._doc;
  console.log(req.body);

  PasswordDoc.findOneAndUpdate(
    { userId: _id },
    { $push: { passwords: req.body } },
    { upsert: true, new: true }
  )
    .then((passwords) => res.send(passwords))
    .catch(next);
});

Router.put("/", (req, res, next) => {
  const { _id } = req.client._doc;
  const { website } = req.body;
  PasswordDoc.findOneAndUpdate(
    { userId: _id, "passwords.website": website },
    { "passwords.$": req.body },
    { new: true }
  )
    .then((passwords) => res.send(passwords))
    .catch(next);
});

module.exports = Router;
