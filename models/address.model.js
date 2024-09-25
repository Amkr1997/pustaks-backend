const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
  street: String,
  city: String,
  state: String,
  country: String,
});

const Address = mongoose.model("newBookAddress", addressSchema);
module.exports = Address;
