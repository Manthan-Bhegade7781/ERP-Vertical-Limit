
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
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

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Leave"],
      required: true,
    },

    checkIn: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance for the same student,
// batch, subject, and date.
attendanceSchema.index(
  {
    studentId: 1,
    batchId: 1,
    subjectId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

// Improve filtering and reporting performance.
attendanceSchema.index({ batchId: 1, subjectId: 1, date: -1 });
attendanceSchema.index({ studentId: 1, date: -1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
