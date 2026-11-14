const express = require("express");

const {
  createStudent,
  getStudents,
  getTeacherStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
} = require("../controllers/student.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create student
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  createStudent
);

// Get all students - Admin / Super Admin
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  getStudents
);

// Get assigned students - Teacher
router.get(
  "/teacher/assigned",
  protect,
  authorizeRoles("teacher"),
  getTeacherStudents
);

// Get student by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  getStudentById
);

// Update student
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateStudent
);

// Activate / deactivate student
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateStudentStatus
);

module.exports = router;