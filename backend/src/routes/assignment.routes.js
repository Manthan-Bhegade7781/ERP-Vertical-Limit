const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  downloadAssignmentAttachment,
} = require("../controllers/assignment.controller");

const uploadAssignmentPDF = require(
  "../middleware/assignmentUpload.middleware"
);

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All assignment routes require authentication.
router.use(protect);

// Download an assignment PDF.
// Keep this route before GET /:id.
router.get(
  "/:id/attachment",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  downloadAssignmentAttachment
);

// Create assignment with an optional PDF attachment.
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  uploadAssignmentPDF,
  createAssignment
);

// Get all assignments accessible to the logged-in user.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAssignments
);

// Get one assignment.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAssignmentById
);

// Update assignment with an optional replacement PDF.
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  uploadAssignmentPDF,
  updateAssignment
);

// Delete assignment.
router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAssignment
);

module.exports = router;