const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    cartList: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewBook",
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    wishList: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewBook",
        },
      },
    ],

    orderHistory: [
      {
        type: new mongoose.Schema(
          {
            bookId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "NewBook",
            },

            quantity: {
              type: Number,
              required: true,
              default: 1,
            },
          },
          { timestamps: true }
        ),
      },
    ],

    address: [
      {
        street: String,
        city: String,
        state: String,
        country: String,
      },
    ],
  },
  { timestamps: true }
);

const Users = mongoose.model("BookUser", userSchema);
module.exports = Users;
