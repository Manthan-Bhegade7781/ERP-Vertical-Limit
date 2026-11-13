const mongoose = require("mongoose");

const FeeRecord = require("../models/feeRecord.model");
const Payment = require("../models/payment.model");
const Student = require("../models/Student");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// --------------------------------------------------
// Helper functions
// --------------------------------------------------

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isSuperAdmin = (user) =>
  user?.roles?.includes("super_admin");

const branchFilter = (user) => {
  if (isSuperAdmin(user)) {
    return {};
  }

  return {
    branchId: user.branchId || null,
  };
};

// --------------------------------------------------
// Notify ONLY active Super Admins about fee activities
// --------------------------------------------------

const notifySuperAdminsAboutFee = async ({
  title,
  message,
  icon = "cash-multiple",
}) => {
  try {
    const superAdmins = await User.find({
      roles: "super_admin",
      status: "active",
    }).select("_id");

    if (!superAdmins.length) {
      return;
    }

    await Promise.allSettled(
      superAdmins.map((admin) =>
        createNotification({
          recipient: admin._id,
          title,
          message,
          type: "fee",
          icon,
        })
      )
    );
  } catch (error) {
    // Notification errors must not interrupt fee operations.
    console.error(
      "Super Admin fee notification error:",
      error.message
    );
  }
};

// --------------------------------------------------
// Get fee status
// --------------------------------------------------

const getStatus = (fee) => {
  if (fee.paidAmount >= fee.totalAmount) {
    return "Paid";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(fee.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return "Overdue";
  }

  if (fee.paidAmount > 0) {
    return "Partially Paid";
  }

  return "Pending";
};

// --------------------------------------------------
// Format fee response
// --------------------------------------------------

const formatFee = (fee) => {
  const item = fee.toObject ? fee.toObject() : fee;

  return {
    ...item,
    remainingAmount: Math.max(
      0,
      item.totalAmount - item.paidAmount
    ),
    status: getStatus(item),
  };
};

// --------------------------------------------------
// 1. Create fee record
// POST /api/fees
// --------------------------------------------------

const createFeeRecord = async (req, res) => {
  try {
    const {
      studentId,
      feeType = "Tuition",
      totalAmount,
      dueDate,
      notes = "",
    } = req.body;

    if (!studentId || totalAmount == null || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Student, total amount and due date are required",
      });
    }

    if (!isValidId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const amount = Number(totalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total amount must be greater than zero",
      });
    }

    if (!["Tuition", "Admission", "Exam", "Other"].includes(feeType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee type",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const student = await Student.findById(studentId);

    if (!student || student.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active student not found",
      });
    }

    const Batch = require("../models/Batch");
    const batch = await Batch.findById(student.batchId);

    if (!batch || batch.isRemoved) {
      return res.status(400).json({
        success: false,
        message: "Student batch is unavailable",
      });
    }

    // Admins can manage fees only for their assigned branch.
    if (
      !isSuperAdmin(req.user) &&
      String(req.user.branchId || "") !== String(batch.branchId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot manage fees for this branch",
      });
    }

    const fee = await FeeRecord.create({
      studentId: student._id,
      batchId: batch._id,
      branchId: batch.branchId,
      feeType,
      totalAmount: Math.round(amount * 100) / 100,
      paidAmount: 0,
      dueDate: parsedDueDate,
      notes: String(notes).trim(),
      createdBy: req.user._id,
    });

    const savedFee = await FeeRecord.findById(fee._id)
      .populate({
        path: "studentId",
        select: "studentId userId",
        populate: {
          path: "userId",
          select: "fullName email mobileNumber",
        },
      })
      .populate("batchId", "name code standard academicYear")
      .populate("branchId", "name code");

    // Notify active Super Admins.
    await notifySuperAdminsAboutFee({
      title: "New Fee Record Created",
      message: `A ${feeType} fee record of ₹${Number(
        savedFee.totalAmount
      ).toFixed(2)} was created for student ${
        savedFee.studentId?.userId?.fullName ||
        savedFee.studentId?.studentId ||
        studentId
      }.`,
      icon: "cash-plus",
    });

    return res.status(201).json({
      success: true,
      message: "Fee record created successfully",
      data: formatFee(savedFee),
    });
  } catch (error) {
    console.error("Create fee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create fee record",
    });
  }
};

// --------------------------------------------------
// 2. Get all fee records
// GET /api/fees
// --------------------------------------------------

const getFeeRecords = async (req, res) => {
  try {
    const filter = { ...branchFilter(req.user) };

    if (req.query.studentId) {
      if (!isValidId(req.query.studentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID",
        });
      }

      filter.studentId = req.query.studentId;
    }

    const records = await FeeRecord.find(filter)
      .populate({
        path: "studentId",
        select: "studentId userId batchId status",
        populate: {
          path: "userId",
          select: "fullName email mobileNumber",
        },
      })
      .populate("batchId", "name code standard academicYear")
      .populate("branchId", "name code")
      .sort({ createdAt: -1 });

    const data = records.map(formatFee);

    return res.status(200).json({
      success: true,
      count: data.length,
      summary: {
        totalFees: data.reduce(
          (sum, fee) => sum + fee.totalAmount,
          0
        ),
        collected: data.reduce(
          (sum, fee) => sum + fee.paidAmount,
          0
        ),
        outstanding: data.reduce(
          (sum, fee) => sum + fee.remainingAmount,
          0
        ),
        overdueCount: data.filter(
          (fee) => fee.status === "Overdue"
        ).length,
      },
      data,
    });
  } catch (error) {
    console.error("Get fees error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee records",
    });
  }
};

// --------------------------------------------------
// 3. Get one fee record and its payments
// GET /api/fees/:id
// --------------------------------------------------

const getFeeRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record ID",
      });
    }

    const fee = await FeeRecord.findOne({
      _id: id,
      ...branchFilter(req.user),
    })
      .populate({
        path: "studentId",
        select: "studentId userId",
        populate: {
          path: "userId",
          select: "fullName email mobileNumber",
        },
      })
      .populate("batchId", "name code standard academicYear")
      .populate("branchId", "name code");

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const payments = await Payment.find({
      feeRecordId: fee._id,
    })
      .populate("receivedBy", "fullName email")
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        fee: formatFee(fee),
        payments,
      },
    });
  } catch (error) {
    console.error("Get fee details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch fee details",
    });
  }
};

// --------------------------------------------------
// 4. Record a payment
// POST /api/fees/:id/payments
// --------------------------------------------------

const recordPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    const {
      amount,
      method,
      paymentDate,
      reference = "",
      remarks = "",
    } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record ID",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    if (!["Cash", "UPI", "Card", "Bank Transfer"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid payment method",
      });
    }

    const parsedDate = paymentDate
      ? new Date(paymentDate)
      : new Date();

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date",
      });
    }

    let paymentId;

    await session.withTransaction(async () => {
      const fee = await FeeRecord.findOne({
        _id: id,
        ...branchFilter(req.user),
      }).session(session);

      if (!fee) {
        const error = new Error("Fee record not found");
        error.statusCode = 404;
        throw error;
      }

      const balance =
        Math.round((fee.totalAmount - fee.paidAmount) * 100) / 100;

      if (paymentAmount > balance) {
        const error = new Error(
          `Payment exceeds the outstanding balance of ${balance.toFixed(2)}`
        );
        error.statusCode = 400;
        throw error;
      }

      const receiptNumber =
        `VL-${Date.now()}-${new mongoose.Types.ObjectId()
          .toString()
          .slice(-6)
          .toUpperCase()}`;

      const [payment] = await Payment.create(
        [
          {
            feeRecordId: fee._id,
            amount: Math.round(paymentAmount * 100) / 100,
            paymentDate: parsedDate,
            method,
            receiptNumber,
            reference: String(reference).trim(),
            remarks: String(remarks).trim(),
            receivedBy: req.user._id,
          },
        ],
        { session }
      );

      fee.paidAmount =
        Math.round((fee.paidAmount + paymentAmount) * 100) / 100;

      await fee.save({ session });

      paymentId = payment._id;
    });

    const payment = await Payment.findById(paymentId)
      .populate("receivedBy", "fullName email");

    const updatedFee = await FeeRecord.findById(id)
      .populate({
        path: "studentId",
        select: "studentId userId",
        populate: {
          path: "userId",
          select: "fullName",
        },
      })
      .populate("batchId", "name code")
      .populate("branchId", "name code");

    // Notify active Super Admins after the transaction succeeds.
    await notifySuperAdminsAboutFee({
      title: "Fee Payment Received",
      message: `A payment of ₹${Number(
        payment.amount
      ).toFixed(2)} was received for fee record ${id}. Receipt: ${
        payment.receiptNumber
      }.`,
      icon: "cash-check",
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        payment,
        fee: formatFee(updatedFee),
      },
    });
  } catch (error) {
    console.error("Record payment error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to record payment",
    });
  } finally {
    await session.endSession();
  }
};

// --------------------------------------------------
// 5. Get payment history
// GET /api/fees/:id/payments
// --------------------------------------------------

const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record ID",
      });
    }

    const fee = await FeeRecord.findOne({
      _id: id,
      ...branchFilter(req.user),
    }).select("_id");

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const payments = await Payment.find({
      feeRecordId: fee._id,
    })
      .populate("receivedBy", "fullName email")
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Payment history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

// --------------------------------------------------
// 6. Student views their own fees
// GET /api/fees/my
// --------------------------------------------------

const getMyFeeRecords = async (req, res) => {
  try {
    const student = await Student.findOne({
      userId: req.user._id,
    }).select("_id studentId");

    if (!student) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const records = await FeeRecord.find({
      studentId: student._id,
    })
      .populate("batchId", "name code standard academicYear")
      .populate("branchId", "name code")
      .sort({ createdAt: -1 });

    const data = await Promise.all(
      records.map(async (record) => {
        const payments = await Payment.find({
          feeRecordId: record._id,
        })
          .select(
            "amount paymentDate method receiptNumber reference"
          )
          .sort({ paymentDate: -1 });

        return {
          ...formatFee(record),
          payments,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Student fees error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your fee records",
    });
  }
};

// --------------------------------------------------
// 6b. Student pays their own fee
// POST /api/fees/my/pay
// --------------------------------------------------

const payStudentFee = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const student = await Student.findOne({ userId: req.user._id }).select(
      "_id studentId userId"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const {
      feeRecordId,
      amount,
      method = "UPI",
      reference = "",
      remarks = "",
    } = req.body;

    if (!isValidId(feeRecordId)) {
      return res.status(400).json({
        success: false,
        message: "Valid feeRecordId is required",
      });
    }

    const paymentAmount = Number(amount);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    const validMethods = ["Cash", "UPI", "Card", "Bank Transfer"];
    const normalizedMethod = validMethods.includes(method) ? method : "UPI";

    let paymentId;

    await session.withTransaction(async () => {
      const fee = await FeeRecord.findOne({
        _id: feeRecordId,
        studentId: student._id,
      }).session(session);

      if (!fee) {
        const error = new Error("Fee record not found for this student");
        error.statusCode = 404;
        throw error;
      }

      const balance =
        Math.round((fee.totalAmount - fee.paidAmount) * 100) / 100;

      if (paymentAmount > balance) {
        const error = new Error(
          `Payment exceeds the outstanding balance of ₹${balance.toFixed(2)}`
        );
        error.statusCode = 400;
        throw error;
      }

      const receiptNumber = `VL-${Date.now()}-${new mongoose.Types.ObjectId()
        .toString()
        .slice(-6)
        .toUpperCase()}`;

      const [payment] = await Payment.create(
        [
          {
            feeRecordId: fee._id,
            amount: Math.round(paymentAmount * 100) / 100,
            paymentDate: new Date(),
            method: normalizedMethod,
            receiptNumber,
            reference:
              String(reference).trim() ||
              `TXN${Math.floor(10000000 + Math.random() * 89999999)}`,
            remarks: String(remarks).trim() || "Online student fee payment",
            receivedBy: req.user._id,
          },
        ],
        { session }
      );

      fee.paidAmount =
        Math.round((fee.paidAmount + paymentAmount) * 100) / 100;

      await fee.save({ session });

      paymentId = payment._id;
    });

    const payment = await Payment.findById(paymentId);
    const updatedFee = await FeeRecord.findById(feeRecordId)
      .populate("batchId", "name code standard academicYear")
      .populate("branchId", "name code");

    // Super Admin notification
    await notifySuperAdmins({
      title: "Student Online Fee Payment",
      message: `Student ${student.studentId} paid ₹${Number(
        payment.amount
      ).toFixed(2)} for ${updatedFee.feeType} (${payment.receiptNumber}).`,
      icon: "cash-check",
    });

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully",
      data: {
        payment,
        fee: formatFee(updatedFee),
      },
    });
  } catch (error) {
    console.error("Student fee payment error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to process fee payment",
    });
  } finally {
    await session.endSession();
  }
};

// --------------------------------------------------
// 7. Update fee record
// --------------------------------------------------

const updateFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { feeType, totalAmount, dueDate, notes } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record ID",
      });
    }

    const fee = await FeeRecord.findOne({
      _id: id,
      ...branchFilter(req.user),
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const allowedFeeTypes = [
      "Tuition",
      "Admission",
      "Exam",
      "Other",
    ];

    if (
      feeType !== undefined &&
      !allowedFeeTypes.includes(feeType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee type",
      });
    }

    if (totalAmount !== undefined) {
      const amount = Number(totalAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Total amount must be greater than zero",
        });
      }

      if (amount < Number(fee.paidAmount || 0)) {
        return res.status(400).json({
          success: false,
          message:
            "Total fee cannot be less than the amount already paid",
        });
      }

      fee.totalAmount = Math.round(amount * 100) / 100;
    }

    if (feeType !== undefined) {
      fee.feeType = feeType;
    }

    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);

      if (!dueDate || Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "A valid due date is required",
        });
      }

      fee.dueDate = parsedDate;
    }

    if (notes !== undefined) {
      fee.notes = String(notes).trim();
    }

    await fee.save();

    // Notify active Super Admins.
    await notifySuperAdminsAboutFee({
      title: "Fee Record Updated",
      message: `Fee record ${fee._id} was updated. Current total fee: ₹${Number(
        fee.totalAmount
      ).toFixed(2)}.`,
      icon: "cash-edit",
    });

    return res.status(200).json({
      success: true,
      message: "Fee record updated successfully",
      data: formatFee(fee),
    });
  } catch (error) {
    console.error("Update fee record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update fee record",
    });
  }
};

// --------------------------------------------------
// 8. Delete fee record
// --------------------------------------------------

const deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee record ID",
      });
    }

    const fee = await FeeRecord.findOne({
      _id: id,
      ...branchFilter(req.user),
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const existingPayment = await Payment.findOne({
      feeRecordId: fee._id,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message:
          "This fee record has payment history and cannot be deleted. Preserve the financial history.",
      });
    }

    await FeeRecord.deleteOne({ _id: fee._id });

    // Notify active Super Admins.
    await notifySuperAdminsAboutFee({
      title: "Fee Record Deleted",
      message: `Fee record ${fee._id} (${fee.feeType}) was deleted.`,
      icon: "cash-remove",
    });

    return res.status(200).json({
      success: true,
      message: "Fee record deleted successfully",
      data: { id: fee._id },
    });
  } catch (error) {
    console.error("Delete fee record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete fee record",
    });
  }
};

// --------------------------------------------------
// Export controllers
// --------------------------------------------------

module.exports = {
  createFeeRecord,
  getFeeRecords,
  getFeeRecordById,
  updateFeeRecord,
  deleteFeeRecord,
  recordPayment,
  getPaymentHistory,
  getMyFeeRecords,
  payStudentFee,
};