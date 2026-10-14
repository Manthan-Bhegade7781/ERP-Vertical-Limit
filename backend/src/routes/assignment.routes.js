
const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignment.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// PDF upload middleware will be added after we verify
// the project's existing upload configuration.

// All assignment routes require authentication.
router.use(protect);

// Create assignment
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  createAssignment
);

// Get all assignments accessible to the logged-in user
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAssignments
);

// Get one assignment
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAssignmentById
);

// Update assignment
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  updateAssignment
);

// Delete assignment (controller restricts this to admins)
router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAssignment
);

module.exports = router;
