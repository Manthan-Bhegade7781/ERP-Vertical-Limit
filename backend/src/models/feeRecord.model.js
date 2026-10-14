const mongoose = require("mongoose");

const feeRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    feeType: {
      type: String,
      enum: ["Tuition", "Admission", "Exam", "Other"],
      default: "Tuition",
      required: true,
      trim: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

// Faster fee searches by student and branch.
feeRecordSchema.index({ studentId: 1, createdAt: -1 });
feeRecordSchema.index({ branchId: 1, dueDate: 1 });

module.exports = mongoose.model("FeeRecord", feeRecordSchema);
