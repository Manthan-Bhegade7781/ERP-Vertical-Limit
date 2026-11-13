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

    mobileNumber: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      default: null,
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

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    resetPasswordOtp: {
      type: String,
      default: null,
    },

    resetPasswordOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Global security transform: never expose passwordHash or OTP tokens
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.resetPasswordOtp;
    delete ret.resetPasswordOtpExpires;
    return ret;
  },
});

userSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.resetPasswordOtp;
    delete ret.resetPasswordOtpExpires;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;