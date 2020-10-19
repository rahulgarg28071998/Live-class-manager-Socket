const mongoose = require("mongoose");

const connectDB = async () => {
  const db =
    "mongodb+srv://testUser123:testUser123@cluster0.vrslz.mongodb.net/LiveClassroom?retryWrites=true&w=majority";
  // const db = "localhost:27017";

  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
