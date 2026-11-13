
const express = require("express");
const router = express.Router();

const {
  createFeeRecord,
  getFeeRecords,
  getFeeRecordById,
  updateFeeRecord,
  deleteFeeRecord,
  recordPayment,
  getPaymentHistory,
  getMyFeeRecords,
  payStudentFee,
} = require("../controllers/fee.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);

// Student: view only their own fees.
router.get(
  "/my",
  authorizeRoles("student"),
  getMyFeeRecords
);

// Student: pay their own fee.
router.post(
  "/my/pay",
  authorizeRoles("student"),
  payStudentFee
);

// Super Admin only: create a fee record.
router.post(
  "/",
  authorizeRoles("super_admin"),
  createFeeRecord
);

// Super Admin only: view all fee records.
router.get(
  "/",
  authorizeRoles("super_admin"),
  getFeeRecords
);

// Super Admin only: edit a fee record.
router.put(
  "/:id",
  authorizeRoles("super_admin"),
  updateFeeRecord
);

// Super Admin only: delete a fee record.
router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  deleteFeeRecord
);

// Super Admin only: record a payment.
router.post(
  "/:id/payments",
  authorizeRoles("super_admin"),
  recordPayment
);

// Super Admin only: view payment history.
router.get(
  "/:id/payments",
  authorizeRoles("super_admin"),
  getPaymentHistory
);

// Super Admin only: view one fee record.
router.get(
  "/:id",
  authorizeRoles("super_admin"),
  getFeeRecordById
);

module.exports = router;
