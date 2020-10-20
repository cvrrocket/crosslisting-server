const Router = require("express").Router();
const { TransactionDoc, ClientDoc } = require("../../schemas/index");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_KEY);

Router.get("/getpayments/:userId", (req, res, next) => {
  let _id = req.params.userId;
  TransactionDoc.find({ userId: _id })
    .then((result) => {
      res.send(result);
    })
    .catch(next);
});

Router.post("/makepayment", async (req, res, next) => {
  let { customer_id, amount } = req.body;
  let stripe_customer_id;
  await ClientDoc.findOne({ _id: customer_id }, { savedCards: 1 })
    .then((bal) => {
      stripe_customer_id = bal.savedCards[0].stripe_customer_id;
    })
    .catch(next);
  try {
    const client = await ClientDoc.findById(customer_id);
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: "usd",
      customer: stripe_customer_id,
      description: "HammocQ services",
      shipping: {
        name: "customer",
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
      userId: customer_id,
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

    TransactionDoc.create(transaction)
      .then((result) => {
        console.log(result);
        res.json({
          success: true,
          msg: "Payment successful",
          receipt_url: transaction.receipt_url,
          date: result.date,
        });
      })
      .catch(next);

    ClientDoc.findOne({ _id: customer_id }, { balance: 1 })
      .then((bal) => {
        //console.log(typeof(amount));
        ClientDoc.findByIdAndUpdate(customer_id, {
          $set: { balance: bal.balance + Number(amount) },
        }).catch(next);
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
      next(error);
    }
  }
});
module.exports = Router;
