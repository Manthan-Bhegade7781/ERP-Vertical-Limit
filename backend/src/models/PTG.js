const mongoose = require("mongoose");

const ptgSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Pending"],
      default: "Scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Improve filtering and sorting performance.
ptgSchema.index({ meetingDate: 1 });
ptgSchema.index({ status: 1 });
ptgSchema.index({ studentId: 1 });
ptgSchema.index({ teacherId: 1 });

const PTG = mongoose.model("PTG", ptgSchema);

module.exports = PTG;