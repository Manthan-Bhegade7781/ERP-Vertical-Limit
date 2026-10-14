
const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    batchSubjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BatchSubject",
      required: true,
      index: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    room: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      enum: ["lecture", "exam"],
      default: "lecture",
    },

    isRemoved: {
      type: Boolean,
      default: false,
      index: true,
    },

    removedAt: {
      type: Date,
      default: null,
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

timetableSchema.index({
  branchId: 1,
  scheduledDate: 1,
  isRemoved: 1,
});

const Timetable = mongoose.model("Timetable", timetableSchema);

module.exports = Timetable;
