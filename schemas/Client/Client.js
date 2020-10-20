const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SavedCard = new Schema({
  stripe_customer_id: {
    type: String,
    required: [true, "stripe_customer_id is required"],
  },
  card_brand: {
    type: String,
    required: [true, "card_brand is required"],
  },
  last_four_digit: {
    type: String,
    required: [true, "last_four_digit is required"],
  },
  exp_month: {
    type: String,
    required: [true, "exp_month is required"],
  },
  exp_year: {
    type: String,
    required: [true, "exp_year is required"],
  },
});

const ClientSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  email: {
    type: String,
    unique: [true, "This email is already registered"],
    required: [true, "Email is required"],
  },
  phoneno: {
    type: String,
    required: [false, "Phone.no is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  paymentStatus: {
    type: Boolean,
    default: false,
  },
  isAllocatedTo: {
    type: String,
    default: "",
  },
  savedCards: [SavedCard],
  forgotPasswordCode: String,
  forgotPasswordExp: Date,
  noOfProducts: { type: Number, default: 0 },
  noOfListings: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("clients", ClientSchema);
