const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    image: String,
    name: String,
    quantity: Number,
    date: String,
  },
  { timestamps: true }
);

const OrderHistory = mongoose.model("Orders", orderSchema);
module.exports = OrderHistory;
