
const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendanceRecords,
  getAttendanceById,
  updateAttendance,
  getStudentAttendanceSummary,
  getMyAttendance,
} = require("../controllers/attendance.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const {
  authorizeAttendanceScope,
} = require("../middleware/attendance.middleware");

// All attendance endpoints require authentication.
router.use(protect);

// Student: view own attendance
router.get(
  "/my",
  authorizeRoles("student"),
  getMyAttendance
);

// Mark attendance
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  authorizeAttendanceScope,
  markAttendance
);

// List attendance records
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAttendanceRecords
);

// Student attendance summary
router.get(
  "/student/:studentId/summary",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getStudentAttendanceSummary
);

// Get a single attendance record
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAttendanceById
);

// Update attendance
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  updateAttendance
);

module.exports = router;
