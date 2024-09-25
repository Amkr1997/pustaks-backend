const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  productDetails: [
    {
      productId: String,
      productQuantity: Number,
    },
  ],
});

const Cart = mongoose.model("newBookCart", cartSchema);
module.exports = Cart;
