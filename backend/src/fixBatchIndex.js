
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("./config/database");

async function fixBatchIndex() {
  try {
    // Connect using your existing database configuration.
    // Note: connectDB calls process.exit(1) if connection fails.
    await connectDB();

    const collection = mongoose.connection.db.collection("batches");
    const indexes = await collection.indexes();

    console.log("\nCurrent batch indexes:");
    console.table(
      indexes.map((index) => ({
        name: index.name,
        fields: JSON.stringify(index.key),
        unique: index.unique || false,
      }))
    );

    const oldIndex = indexes.find(
      (index) => index.name === "batchCode_1"
    );

    if (!oldIndex) {
      console.log("\nNo batchCode_1 index found. Nothing changed.");
      return;
    }

    // Remove only after confirming this index is obsolete.
    await collection.dropIndex("batchCode_1");

    console.log("\nSuccessfully removed obsolete batchCode_1 index.");
  } catch (error) {
    console.error("\nIndex repair failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixBatchIndex();
