require("dotenv").config();

const mongoose = require("mongoose");

const updateBranch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const result = await mongoose.connection.collection("branches").updateOne(
      {
        _id: new mongoose.Types.ObjectId("6a932728ec3c10df2a3d41a6"),
      },
      {
        $set: {
          city: "Pune",
          state: "Maharashtra",
          branchHeadId: null,
          contactNumber: "9876543210",
          email: "pune.branch@school.com",
        },
      }
    );

    console.log("Update result:", result);

    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Branch update failed:", error);
  }
};

updateBranch();