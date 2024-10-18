const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  bookId: {
    type: String,
    required: true,
  },
  bookQuantity: {
    type: Number,
    required: true,
  },
});

const Cart = mongoose.model("newBookCart", cartSchema);
module.exports = Cart;
