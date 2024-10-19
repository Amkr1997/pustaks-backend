const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  bookId: {
    type: String,
    required: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  bookPrice: {
    type: Number,
    required: true,
  },
  bookImgUrl: {
    type: String,
    required: true,
  },
  bookCategory: {
    type: String,
    required: true,
  },
  bookRating: {
    type: Number,
    required: true,
  },
  bookQuantity: {
    type: Number,
    required: true,
  },
});

const Cart = mongoose.model("newBookCart", cartSchema);
module.exports = Cart;
