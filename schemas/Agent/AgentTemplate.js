const mongoose = require("mongoose");
const ProductSchema = require("../Product").schema;
const Schema = mongoose.Schema;

const SingleAgentTemplate = new Schema({
  name: {
    type: String,
    required: [true, "Template Name is required."],
  },
  data: ProductSchema,
});

const AgentTemplateSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User Id is required."],
  },
  templates: [SingleAgentTemplate],
});

module.exports = mongoose.model("agentTemplates", AgentTemplateSchema);
