const mongoose = require("mongoose");

const Transactions = mongoose.Schema({
  userId: {
    type: String,
    required: [true, "User Id is required."],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  receipt_url: {
    type: String,
    required: [true, "Receipt URL is required."],
  },
  status: {
    type: String,
    required: [true, "status is required."],
  },
  receipt_no: {
    type: String,
  },
  network_status: {
    type: String,
    required: [true, "network_status is required."],
  },
  seller_message: {
    type: String,
    required: [true, "seller_message is required."],
  },
  source: {
    type: String,
    required: [true, "source is required."],
  },
  charge_id: {
    type: String,
    required: [true, "charge_id is required."],
  },
  balance_transaction_id: {
    type: String,
    required: [true, "balance_transaction_id is required."],
  },
});
module.exports = mongoose.model("transactions", Transactions);
