const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    assignmentTitle: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },

    assignmentCode: {
      type: String,
      required: [true, "Assignment code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"],
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },

    assignmentType: {
      type: String,
      enum: [
        "homework",
        "practice_set",
        "worksheet",
        "project",
        "revision",
      ],
      required: [true, "Assignment type is required"],
      default: "homework",
    },

    assignedDate: {
      type: Date,
      required: [true, "Assigned date is required"],
    },

    submissionDate: {
      type: Date,
      required: [true, "Submission date is required"],
    },

    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: [1, "Total marks must be at least 1"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    
    attachment: {
      fileName: {
        type: String,
        trim: true,
        default: "",
      },
      filePath: {
        type: String,
        trim: true,
        default: "",
      },
      mimeType: {
        type: String,
        trim: true,
        default: "",
      },
      fileSize: {
        type: Number,
        default: 0,
      },
      cloudinaryPublicId: {
        type: String,
        trim: true,
        default: "",
      },
      resourceType: {
        type: String,
        trim: true,
        default: "",
      },
      deliveryType: {
        type: String,
        trim: true,
        default: "",
      },
    },


    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validate the date range.
assignmentSchema.pre("validate", function () {
  if (
    this.assignedDate &&
    this.submissionDate &&
    this.submissionDate < this.assignedDate
  ) {
    this.invalidate(
      "submissionDate",
      "Submission date cannot be before the assigned date"
    );
  }
});

module.exports = mongoose.model("Assignment", assignmentSchema);