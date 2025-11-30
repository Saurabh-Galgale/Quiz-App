// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.bqgmeka.mongodb.net/quizapp?retryWrites=true&w=majority&appName=Cluster0`
    );

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // Exit process if DB fails in backend apps
    process.exit(1);
  }
};

module.exports = connectDB;
