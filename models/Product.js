const mongoose = require("mongoose");

const Product = mongoose.model("Product", {
  name: String,
  quantity: Number,
});

module.exports = Product;
