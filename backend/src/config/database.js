const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MongoDB URI is missing. Check MONGODB_URI or MONGO_URI in .env"
      );
    }

    const connection = await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || "test",
    });

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

module.exports = connectDB;
