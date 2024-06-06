const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: { type: [String] },
    name: { type: String },
    description: { type: String },
    price: { type: Number },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
