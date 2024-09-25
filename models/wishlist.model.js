const mongoose = require("mongoose");

const wishListSchema = mongoose.Schema({
  productId: String,
});

const WishList = mongoose.model("newBookWishList", wishListSchema);
module.exports = WishList;
