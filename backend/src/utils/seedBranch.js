require("dotenv").config();

const mongoose = require("mongoose");
const Branch = require("../models/Branch");

const createBranch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingBranch = await Branch.findOne({
      code: "TLG",
    });

    if (existingBranch) {
      console.log("Talegaon branch already exists");
      process.exit(0);
    }

    const branch = await Branch.create({
      name: "Talegaon",
      code: "TLG",
      address: "Talegaon Dabhade",
      status: "active",
    });

    console.log("Branch created:", branch._id);

    process.exit(0);
  } catch (error) {
    console.error("Branch creation failed:", error.message);
    process.exit(1);
  }
};

createBranch();