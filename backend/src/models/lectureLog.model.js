const mongoose = require("mongoose");

const lectureLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
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
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Improve filtering performance.
lectureLogSchema.index({
  teacherId: 1,
  date: -1,
});

lectureLogSchema.index({
  batchId: 1,
  subjectId: 1,
  date: -1,
});

const LectureLog = mongoose.model(
  "LectureLog",
  lectureLogSchema
);

module.exports = LectureLog;