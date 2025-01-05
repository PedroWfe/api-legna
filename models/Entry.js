const mongoose = require("mongoose");

const Entry = mongoose.model("Entry", {
  date: Date,
  supplierId: String,
  materialName: String,
  quantity: Number,
  totalValue: Number,
  author: String,
});

module.exports = Entry;
