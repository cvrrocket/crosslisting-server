const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PasswordSchema = new Schema({
  website: {
    type: String,
    required: [true, "Website is required."],
  },
  username: {
    type: String,
    require: [true, "Username is required."],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
});

const WebsitePasswordsSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User Id is required."],
    unique: [true, "UserId is already used"],
  },
  passwords: [PasswordSchema],
});

module.exports = mongoose.model("passwords", WebsitePasswordsSchema);
