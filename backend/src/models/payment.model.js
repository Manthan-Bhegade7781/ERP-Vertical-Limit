const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    feeRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeRecord",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    method: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Bank Transfer"],
      required: true,
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ feeRecordId: 1, paymentDate: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
