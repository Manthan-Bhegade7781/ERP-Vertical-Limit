const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
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

// Prevent duplicate teacher attendance for the same
// teacher, batch, subject and date.
teacherAttendanceSchema.index(
  {
    teacherId: 1,
    batchId: 1,
    subjectId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

// Improve filtering and reporting performance.
teacherAttendanceSchema.index({
  batchId: 1,
  subjectId: 1,
  date: -1,
});

teacherAttendanceSchema.index({
  teacherId: 1,
  date: -1,
});

const TeacherAttendance = mongoose.model(
  "TeacherAttendance",
  teacherAttendanceSchema
);

module.exports = TeacherAttendance;