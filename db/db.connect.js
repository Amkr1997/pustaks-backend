const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const mongoURI = process.env.MONGO_URI;

const initialisation = async () => {
  try {
    const connect = await mongoose.connect(mongoURI);

    if (connect) {
      console.log("Connected to mongoDB");
    }
  } catch (error) {
    console.log("An error happened while connecting to mongoDB", error);
  }
};

module.exports = { initialisation };
