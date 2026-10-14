const mongoose = require("mongoose");

const batchSubjectSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// A subject should not be assigned twice to the same batch
batchSubjectSchema.index(
  { batchId: 1, subjectId: 1 },
  { unique: true }
);

const BatchSubject = mongoose.model(
  "BatchSubject",
  batchSubjectSchema
);

module.exports = BatchSubject;