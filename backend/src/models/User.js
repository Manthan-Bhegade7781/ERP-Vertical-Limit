const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    roles: {
      type: [
        {
          type: String,
          enum: ["super_admin", "admin", "teacher", "student"],
        },
      ],
      required: true,
      validate: {
        validator: (roles) => roles.length > 0,
        message: "At least one role is required",
      },
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "active", "rejected", "inactive"],
      default: "pending",
    },

    registrationRole: {
      type: String,
      enum: ["teacher", "student", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;