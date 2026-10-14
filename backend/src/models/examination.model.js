
const mongoose = require("mongoose");

const examinationSchema = new mongoose.Schema(
  {
    examinationName: {
      type: String,
      required: true,
      trim: true,
    },

    examinationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

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

    examinationDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "results_published"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

examinationSchema.index({
  batchId: 1,
  subjectId: 1,
  examinationDate: 1,
});

const Examination = mongoose.model(
  "Examination",
  examinationSchema
);

module.exports = Examination;
