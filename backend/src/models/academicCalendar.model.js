const mongoose = require("mongoose");

const academicCalendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    date: {
      type: Date,
      required: [true, "Event date is required"],
    },

    category: {
      type: String,
      enum: [
        "Academic",
        "Examination",
        "Holiday",
        "Meeting",
        "Event",
        "Other",
      ],
      default: "Academic",
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

academicCalendarSchema.index({ date: 1, branchId: 1 });
academicCalendarSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model(
  "AcademicCalendar",
  academicCalendarSchema
);