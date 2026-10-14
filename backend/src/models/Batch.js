const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    standard: {
      type: String,
      required: true,
      enum: ["8th", "9th", "10th", "11th", "12th"],
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    schedule: {
      startTime: {
        type: String,
        required: true,
        trim: true,
      },

      endTime: {
        type: String,
        required: true,
        trim: true,
      },

      days: {
        type: [String],
        required: true,
        validate: {
          validator: (days) => days.length > 0,
          message: "At least one class day is required",
        },
      },
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    isRemoved: {
      type: Boolean,
      default: false,
    },

    removedAt: {
      type: Date,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;