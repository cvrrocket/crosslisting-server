const Router = require("express").Router();
const { ClientDoc, TransactionDoc, RateDoc } = require("../../schemas/index");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

Router.get("/rates", (req, res, next) => {
  RateDoc.find()
    .then((rates) => res.send(rates[0].Rates))
    .catch(next);
});

Router.post("/firstpayment", async (req, res, next) => {
  console.log("started");
  const { _id } = req.client._doc;
  let email = req.body.email;
  let { brand, exp_month, exp_year, last4 } = req.body.card_details.token.card;
  let { id } = req.body.card_details.token;
  try {
    //creating stripe customer
    //console.log("token:"+id);
    const client = await ClientDoc.findById(_id);
    const customer = await stripe.customers.create({
      source: id,
      email: email,
      address: {
        line1: "510 Townsend St",
        postal_code: "98140",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
    });

    let savedCard = {
      stripe_customer_id: customer.id,
      card_brand: brand,
      last_four_digit: last4,
      exp_month: exp_month,
      exp_year: exp_year,
    };
    //first payment using stripe
    const charge = await stripe.charges.create({
      amount: req.body.price * 100,
      currency: "usd",
      customer: customer.id,
      description: "HammoQ services",
      shipping: {
        name: client.firstName,
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      },
    });
    let transaction = {
      userId: _id,
      amount: charge.amount / 100,
      receipt_url: charge.receipt_url,
      status: charge.status,
      receipt_no: charge.receipt_number,
      network_status: charge.outcome.network_status,
      seller_message: charge.outcome.seller_message,
      source: charge.source.id,
      charge_id: charge.id,
      balance_transaction_id: charge.balance_transaction,
    };
    console.log(savedCard);
    console.log("user id", _id);
    let savedCards = [];
    savedCards.push(savedCard);
    Promise.all([
      ClientDoc.findOneAndUpdate(
        { _id: _id },
        { $push: { savedCards: savedCard } }
      ),
      TransactionDoc.create(transaction),
    ])
      .then(async (result) => {
        //console.log("result", result);
        //res.json({ success: true, msg: "done" });

        try {
          const bal = await ClientDoc.findById(_id);
          const client_bal = bal.balance;
          const updatedPost = await ClientDoc.updateOne(
            { _id: _id },
            { $set: { balance: client_bal + req.body.price } }
          );
          //console.log("done");
          res.send("done");
        } catch (err) {
          res.json({ message: err });
        }
      })
      .catch(next);
  } catch (error) {
    console.log(error);
    if (
      error.message ==
      "Your card was declined. This transaction requires authentication."
    ) {
      return res.json({ status: false, msg: err.message });
    } else {
      res.send(error);
    }
  }
});

Router.put("/addstatus", async (req, res, next) => {
  const { _id } = req.client._doc;
  try {
    const clientUpdate = await ClientDoc.updateOne(
      { _id: _id },
      { $set: { paymentStatus: true } }
    );
    console.log(clientUpdate);
    const client = await ClientDoc.findOne({ _id: _id });
    console.log(client);
    res.send(client);
  } catch (err) {
    res.json({ message: err });
  }
});

Router.get("/getpayments", async (req, res, next) => {
  const { _id } = req.client._doc;
  TransactionDoc.find({ userId: _id })
    .then((result) => {
      res.json({ success: true, result: result });
    })
    .catch(next);
  const txns = await stripe.customers.listBalanceTransactions(
    "cus_HRdD7W1KQLUxmI"
  );
  console.log(txns);
});

Router.post("/addpayment", async (req, res, next) => {
  const { _id } = req.client._doc;
  let email = req.body.email;
  let {
    brand,
    exp_month,
    exp_year,
    last4,
    name,
    address_country,
    address_line1,
  } = req.body.card_details.token.card;
  let { id } = req.body.card_details.token;

  try {
    console.log("started ", _id);
    ClientDoc.findOne({ _id: _id }, { "savedCards.stripe_customer_id": 1 })
      .then(async (result) => {
        console.log("result");
        console.log("value", result);
        if (result._id) {
          let stripe_customer_id = result.savedCards[0].stripe_customer_id;
          let addCard = await stripe.customers.createSource(
            stripe_customer_id,
            { source: id }
          );
          console.log(addCard);
          let savedCard = {
            stripe_customer_id: stripe_customer_id,
            card_brand: addCard.brand,
            last_four_digit: addCard.last4,
            exp_month: addCard.exp_month,
            exp_year: addCard.exp_year,
            card_id: addCard.id,
          };
          ClientDoc.findOneAndUpdate(
            { _id: _id },
            { $push: { savedCards: savedCard } }
          )
            .then((insertCard) => {
              //console.log(insertCard);
            })
            .catch(next);
        } else {
        }
      })
      .catch(next);
  } catch (error) {
    res.send(error);
  }
});

Router.post("/makepayment", async (req, res, next) => {
  let { customer_id, amount } = req.body;
  ClientDoc.findOne({ _id: customer_id }, { balance: 1 })
    .then((bal) => {
      ClientDoc.findByIdAndUpdate(customer_id, {
        $set: { balance: bal.balance - amount },
      }).catch(next);
    })
    .catch(next);
});

module.exports = Router;
