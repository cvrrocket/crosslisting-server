const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AgentSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  noOfClients: { type: Number, default: 0 },
});

module.exports = mongoose.model("agents", AgentSchema);
