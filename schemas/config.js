const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigsSchema = new Schema({
  from: { type: String, default: "" },
  to: { type: String, default: "" },
});

const ConfigSchema = new Schema({
  Configs: [ConfigsSchema],
});

module.exports = mongoose.model("config", ConfigSchema);
