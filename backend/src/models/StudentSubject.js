const mongoose = require("mongoose");

const studentSubjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    batchSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BatchSubject",
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

// A student can have only one enrollment record
// for a particular batch-subject assignment.
studentSubjectSchema.index(
  { studentId: 1, batchSubjectId: 1 },
  { unique: true }
);

const StudentSubject = mongoose.model(
  "StudentSubject",
  studentSubjectSchema
);

module.exports = StudentSubject;
