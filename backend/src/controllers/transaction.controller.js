
const mongoose = require('mongoose');
const Transaction = require('../models/transaction.model');

const hasRole = (user, role) =>
  Array.isArray(user.roles) && user.roles.includes(role);

const isSuperAdmin = (user) => hasRole(user, 'super_admin');

const getBranchFilter = (user) => {
  if (isSuperAdmin(user)) {
    return {};
  }

  if (!user.branchId) {
    const error = new Error('Your account is not assigned to a branch');
    error.statusCode = 403;
    throw error;
  }

  return { branchId: user.branchId };
};

const generateTransactionId = () =>
  `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const branchFilter = getBranchFilter(req.user);
    const { search, type, status, category, branchId, page = 1, limit = 20 } =
      req.query;

    const filter = {
    ...branchFilter,
    isDeleted: { $ne: true },
    };

    if (type && ['Income', 'Expense'].includes(type)) {
      filter.type = type;
    }

    if (status && ['Completed', 'Pending'].includes(status)) {
      filter.status = status;
    }

    if (
      category &&
      ['Fees', 'Salary', 'Utilities', 'Purchase', 'Other'].includes(category)
    ) {
      filter.category = category;
    }

    // Only Super Admin may select another branch.
    if (branchId && isSuperAdmin(req.user)) {
      if (!mongoose.isValidObjectId(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID',
        });
      }

      filter.branchId = branchId;
    }

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      filter.$or = [
        { transactionId: { $regex: escapedSearch, $options: 'i' } },
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { category: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(limit, 10) || 20)
    );

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('createdBy', 'fullName email')
        .sort({ date: -1, createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      Transaction.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to fetch transactions',
    });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      amount,
      date,
      paymentMode,
      reference,
      status,
      branchId,
    } = req.body;

    if (
      !title?.trim() ||
      !type ||
      !category ||
      amount === undefined ||
      amount === null ||
      amount === '' ||
      !date ||
      !paymentMode
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Title, type, category, amount, date and payment mode are required',
      });
    }

    const numericAmount = Number(amount);
    const transactionDate = new Date(date);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    if (Number.isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid transaction date',
      });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type',
      });
    }

    if (
      !['Fees', 'Salary', 'Utilities', 'Purchase', 'Other'].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction category',
      });
    }

    if (!['Cash', 'UPI', 'Bank Transfer', 'Card'].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment mode',
      });
    }

    const transactionStatus = status || 'Completed';

    if (!['Completed', 'Pending'].includes(transactionStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction status',
      });
    }

    let assignedBranchId;

    if (isSuperAdmin(req.user)) {
      // A Super Admin can create an organization-wide transaction
      // without a branch, or assign it to a valid branch.
      if (branchId) {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch ID',
          });
        }

        assignedBranchId = branchId;
      } else {
        assignedBranchId = null;
      }
    } else {
      // Admin cannot choose or override their assigned branch.
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'Your account is not assigned to a branch',
        });
      }

      assignedBranchId = req.user.branchId;
    }

    const transaction = await Transaction.create({
      transactionId: generateTransactionId(),
      title: title.trim(),
      description: description?.trim() || '',
      type,
      category,
      amount: numericAmount,
      date: transactionDate,
      paymentMode,
      reference: reference?.trim() || '',
      status: transactionStatus,
      branchId: assignedBranchId,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to create transaction',
    });
  }
};

// GET /api/transactions/summary
const getTransactionSummary = async (req, res) => {
  try {
    const branchFilter = getBranchFilter(req.user);
    const { branchId } = req.query;
    const filter = {
    ...branchFilter,
    isDeleted: { $ne: true },
    };

    if (branchId && isSuperAdmin(req.user)) {
      if (!mongoose.isValidObjectId(branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID',
        });
      }

      filter.branchId = branchId;
    }

    const [completed, pendingIncome] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...filter, status: 'Completed' } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: {
            ...filter,
            type: 'Income',
            status: 'Pending',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const income = completed.find((item) => item._id === 'Income');
    const expense = completed.find((item) => item._id === 'Expense');
    const pending = pendingIncome[0];

    const totalIncome = income?.total || 0;
    const totalExpenses = expense?.total || 0;

    return res.status(200).json({
      success: true,
      message: 'Transaction summary fetched successfully',
      data: {
        totalIncome,
        totalExpenses,
        pendingIncome: pending?.total || 0,
        netBalance: totalIncome - totalExpenses,
        completedIncomeCount: income?.count || 0,
        completedExpenseCount: expense?.count || 0,
        pendingIncomeCount: pending?.count || 0,
      },
    });
  } catch (error) {
    console.error('Transaction summary error:', error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to fetch transaction summary',
    });
  }
};


const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID',
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Branch admins can update only their own branch's records.
    if (!isSuperAdmin(req.user)) {
      if (
        !req.user.branchId ||
        !transaction.branchId ||
        transaction.branchId.toString() !== req.user.branchId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this transaction',
        });
      }
    }

    const {
      title,
      description,
      type,
      category,
      amount,
      date,
      paymentMode,
      reference,
      status,
      branchId,
    } = req.body;

    const updates = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || '';
    }

    if (type !== undefined) {
      if (!['Income', 'Expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction type',
        });
      }
      updates.type = type;
    }

    if (category !== undefined) {
      if (
        !['Fees', 'Salary', 'Utilities', 'Purchase', 'Other'].includes(category)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction category',
        });
      }
      updates.category = category;
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (
        amount === '' ||
        amount === null ||
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero',
        });
      }

      updates.amount = numericAmount;
    }

    if (date !== undefined) {
      const transactionDate = new Date(date);

      if (Number.isNaN(transactionDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction date',
        });
      }

      updates.date = transactionDate;
    }

    if (paymentMode !== undefined) {
      if (!['Cash', 'UPI', 'Bank Transfer', 'Card'].includes(paymentMode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment mode',
        });
      }
      updates.paymentMode = paymentMode;
    }

    if (reference !== undefined) {
      updates.reference = reference?.trim() || '';
    }

    if (status !== undefined) {
      if (!['Completed', 'Pending'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction status',
        });
      }
      updates.status = status;
    }

    // Only Super Admin can move a transaction between branches.
    if (branchId !== undefined) {
      if (!isSuperAdmin(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admin can change the transaction branch',
        });
      }

      if (branchId === null || branchId === '') {
        updates.branchId = null;
      } else {
        if (!mongoose.isValidObjectId(branchId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch ID',
          });
        }
        updates.branchId = branchId;
      }
    }

    Object.assign(transaction, updates);
    transaction.updatedBy = req.user._id;

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to update transaction',
    });
  }
};


const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID',
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Restrict branch admins to their assigned branch.
    if (!isSuperAdmin(req.user)) {
      if (
        !req.user.branchId ||
        !transaction.branchId ||
        transaction.branchId.toString() !== req.user.branchId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this transaction',
        });
      }
    }

    transaction.isDeleted = true;
    transaction.deletedBy = req.user._id;
    transaction.deletedAt = new Date();

    await transaction.save();

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        _id: transaction._id,
        transactionId: transaction.transactionId,
        isDeleted: transaction.isDeleted,
        deletedAt: transaction.deletedAt,
      },
    });
  } catch (error) {
    console.error('Delete transaction error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete transaction',
    });
  }
};



module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getTransactionSummary,
  updateTransaction,
};
