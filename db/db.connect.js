const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://neoGStudent:neoGStudentAmanKhare@neog.thgfor2.mongodb.net/?retryWrites=true&w=majority&appName=neoG`;

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
