
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    type: {
      type: String,
      enum: ['Income', 'Expense'],
      required: [true, 'Transaction type is required'],
    },

    category: {
      type: String,
      enum: ['Fees', 'Salary', 'Utilities', 'Purchase', 'Other'],
      required: [true, 'Transaction category is required'],
    },

    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },

    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },

    paymentMode: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card'],
      required: [true, 'Payment mode is required'],
    },

    reference: {
      type: String,
      trim: true,
      default: '',
    },

    status: {
      type: String,
      enum: ['Completed', 'Pending'],
      default: 'Completed',
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    isDeleted: {
    type: Boolean,
    default: false,
    },

    deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    },

    deletedAt: {
    type: Date,
    default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ branchId: 1, date: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
