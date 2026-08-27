require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("./password");

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "superadmin@verticalclasses.com";
    const password = "SuperAdmin@123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    const passwordHash = await hashPassword(password);

    const superAdmin = await User.create({
      fullName: "Vertical Classes Super Admin",
      email,
      passwordHash,
      roles: ["super_admin"],
      branchId: null,
      status: "active",
      registrationRole: null,
    });

    console.log("Super Admin created successfully");
    console.log("Email:", superAdmin.email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Super Admin creation failed:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();