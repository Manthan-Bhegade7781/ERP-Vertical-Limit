const express = require("express");

const {
  createStudent,
  getStudents,
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
  authorizeRoles("super_admin"),
  createStudent
);

// Get all students
router.get(
  "/",
  protect,
  getStudents
);

// Get student by ID
router.get(
  "/:id",
  protect,
  getStudentById
);

// Update student
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateStudent
);

// Activate / deactivate student
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin"),
  updateStudentStatus
);

module.exports = router;