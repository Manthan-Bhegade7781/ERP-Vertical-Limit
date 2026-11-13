const mongoose = require("mongoose");

const examinationResultSchema = new mongoose.Schema(
  {
    examinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Examination",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: String,
      trim: true,
      default: "Subject Teacher",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["passed", "failed", "evaluated"],
      default: "evaluated",
    },
  },
  {
    timestamps: true,
  }
);

examinationResultSchema.index({ studentId: 1, date: -1 });

const ExaminationResult = mongoose.model(
  "ExaminationResult",
  examinationResultSchema
);

module.exports = ExaminationResult;
