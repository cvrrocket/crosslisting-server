const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = mongoose.Schema({
  images: {
    default_image: String,
    brand_image: String,
    model_image: String,
    side1_image: String,
    side2_image: String,
    front_image: String,
    back_image: String,
    condition1_image: String,
    condition2_image: String,
    condition3_image: String,
    condition4_image: String,
    condition5_image: String,
  },
  mercari: {
    title: { type: String },
    check: { type: Boolean, default: false },
    url: { type: String, default: "" },
  },
  poshmark: {
    title: { type: String },
    check: { type: Boolean, default: false },
    url: { type: String, default: "" },
  },
  ebay: {
    title: { type: String },
    check: { type: Boolean, default: false },
    url: { type: String, default: "" },
  },
  delist: {
    title: { type: String },
    check: { type: Boolean, default: false },
    url: { type: String, default: "" },
  },
  others: { type: Object },
  date: {
    type: Date,
    default: Date.now(),
  },
  size: { type: String, default: "" },
  brand: { type: String, default: "" },
  colorShade: { type: String, default: "" },
  material: { type: String, default: "" },
  pattern: { type: String, default: "" },
  seasonOrWeather: { type: String, default: "" },
  care: { type: String, default: "" },
  madeIn: { type: String, default: "" },
  title: { type: String, default: "" },
  waist: { type: String, default: "" },
  inseam: { type: String, default: "" },
  rise: { type: String, default: "" },
  bottomDescription: { type: String, default: "" },
  price: { type: Number, default: 0 },
  mrp: { type: Number, default: 0 },
  msrp: { type: Number, default: 0 },
  sku: { type: String, default: "" },
  upc: { type: String, default: "" },
  quantity: { type: Number, default: 1 },
  weightLB: { type: Number, default: 0 },
  weightOZ: { type: Number, default: 0 },
  zipCode: { type: String, default: "" },
  packageLength: { type: Number, default: 0 },
  packageWidth: { type: Number, default: 0 },
  packageHeight: { type: Number, default: 0 },
  category: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  line1: { type: String, default: "" },
  line2: { type: String, default: "" },
  line3: { type: String, default: "" },
  line4: { type: String, default: "" },
  line5: { type: String, default: "" },
  line6: { type: String, default: "" },
  line7: { type: String, default: "" },
  line8: { type: String, default: "" },
  status: Boolean,
  listed: { type: Boolean, default: false },
  condition_name: { type: String, default: "" },
  keywords: { type: String, default: "" },
  model: { type: String, default: "" },
  note: { type: String, default: "" },
  costOfGoods: { type: String, default: "" },
  shippingFees: { type: String, default: "" },
  profit: { type: Number, default: 0 },
  style: { type: String, default: "" },
  extraMeasures: { type: Object },
  activity: { type: String, default: "" },
  gender: { type: String, default: "" },
});

const UserProductsSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User id is required"],
    unique: [true, "User is already added."],
  },
  products: [ProductSchema],
});

module.exports = {
  model: mongoose.model("products", UserProductsSchema),
  schema: ProductSchema,
};