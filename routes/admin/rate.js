const Router = require("express").Router();
const { RateDoc } = require("../../schemas");

Router.post("/", (req, res, next) => {
  RateDoc.findOneAndUpdate(
    {},
    { $push: { Rates: req.body } },
    { new: true, upsert: true }
  )
    .then((response) => res.send(response))
    .catch(next);
});

Router.post("/update", async (req, res, next) => {
  await RateDoc.find()
    .then((rates) => {
      fromdate = new Date();
      todate = new Date();
      id = rates[0].Rates[rates[0].Rates.length - 1]._id;
      todate.setMonth(todate.getMonth() + 2);

      const obj = {
        basic: rates[0].Rates[rates[0].Rates.length - 1].basic,
        advance: rates[0].Rates[rates[0].Rates.length - 1].advance,
        list: rates[0].Rates[rates[0].Rates.length - 1].list,
        date_to: todate,
        date_from: fromdate,
      };

      RateDoc.findOneAndUpdate(
        {},
        { $push: { Rates: obj } },
        { new: true, upsert: true }
      )
        .then((response) => res.send(response))
        .catch(next);

      //   console.log(todate);
      //   console.log(id);
      //     RateDoc.updateOne({"Rates._id":id},{$push:{"Rates.$.date_to":todate,"Rates.$.from_date2":fromdate}})
      //     .then(rates => {
      //       console.log(rates);
      //     })
      //     .catch(next)
    })
    .catch(next);
});

Router.get("/", (req, res, next) => {
  RateDoc.find()
    .then((response) => res.send(response))
    .catch(next);
});

Router.get("/rates", (req, res, next) => {
  RateDoc.find()
    .then((rates) => res.send(rates[0].Rates))
    .catch(next);
});

module.exports = Router;
