const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Academic",
        "Examination",
        "Results",
        "Attendance",
        "Fees",
        "PTG",
        "Events",
        "Holiday",
        "Notice",
        "General",
      ],
      default: "General",
      required: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      required: true,
    },

    audience: {
      type: String,
      enum: [
        "All Users",
        "All Students",
        "Students",
        "Teachers",
        "Students & Teachers",
        "Academic Staff",
        "Staff",
      ],
      default: "All Students",
      required: true,
    },

    // Empty array = normal audience-based announcement.
    // Non-empty array = announcement assigned to specific teachers.
    // Store User account IDs, NOT Teacher profile IDs.
    targetTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    status: {
      type: String,
      enum: ["Published", "Draft", "Scheduled", "Expired"],
      default: "Draft",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({
  branchId: 1,
  status: 1,
});

announcementSchema.index({
  audience: 1,
  status: 1,
});

announcementSchema.index({
  targetTeachers: 1,
  status: 1,
});

announcementSchema.index({
  createdBy: 1,
  createdAt: -1,
});

announcementSchema.index({
  expiresAt: 1,
});

module.exports = mongoose.model(
  "Announcement",
  announcementSchema
);