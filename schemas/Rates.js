const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RatesSchema = new Schema({
  basic: { type: Number, default: 0 },
  advance: { type: Number, default: 0 },
  list: { type: Number, default: 0 },
  date_from: { type: Date },
  date_to: { type: Date },
});

const RateSchema = new Schema({
  Rates: [RatesSchema],
});

module.exports = mongoose.model("rates", RateSchema);
