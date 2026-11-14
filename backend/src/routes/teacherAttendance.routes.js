const express = require("express");
const router = express.Router();

const {
  markTeacherAttendance,
  getTeacherAttendanceRecords,
  getTeacherAttendanceById,
  updateTeacherAttendance,
} = require("../controllers/teacherAttendance.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All teacher attendance endpoints require authentication.
router.use(protect);

// Mark teacher attendance.
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  markTeacherAttendance
);

// List teacher attendance records.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getTeacherAttendanceRecords
);

// Get a single teacher attendance record.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getTeacherAttendanceById
);

// Update teacher attendance.
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  updateTeacherAttendance
);

module.exports = router;