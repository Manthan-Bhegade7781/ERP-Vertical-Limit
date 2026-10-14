
const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipients: {
      type: [recipientSchema],
      required: true,
      validate: {
        validator(recipients) {
          if (!recipients || recipients.length === 0) {
            return false;
          }

          const ids = recipients.map((recipient) =>
            recipient.user.toString()
          );

          return new Set(ids).size === ids.length;
        },
        message: "At least one unique recipient is required.",
      },
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    category: {
      type: String,
      enum: [
        "General",
        "Academic",
        "Examination",
        "Fees",
        "Reports",
        "Training",
        "Events",
        "Assignments",
      ],
      default: "General",
    },

    priority: {
      type: String,
      enum: ["Important", "Normal"],
      default: "Normal",
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ "recipients.user": 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
