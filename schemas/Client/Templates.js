const mongoose = require("mongoose");
const ProductSchema = require("../Product").schema;
const Schema = mongoose.Schema;

const SingleTemplate = new Schema({
  name: {
    type: String,
    required: [true, "Template Name is required."],
  },
  data: ProductSchema,
});

const TemplateSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User Id is required."],
  },
  templates: [SingleTemplate],
});

module.exports = mongoose.model("templates", TemplateSchema);
