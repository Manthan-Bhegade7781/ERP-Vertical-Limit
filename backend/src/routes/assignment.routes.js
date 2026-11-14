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

const uploadAssignmentPDF = require("../middleware/assignmentUpload.middleware");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);

// Download an assignment PDF.
// Keep this route before GET /:id so :id doesn't match "attachment".
router.get(
  "/:id/attachment",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  downloadAssignmentAttachment
);

// Get all assignments accessible to the logged-in user.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAssignments
);

// View individual assignment.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAssignmentById
);

// Create assignment with an optional PDF attachment.
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  uploadAssignmentPDF,
  createAssignment
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  uploadAssignmentPDF,
  updateAssignment
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAssignment
);

module.exports = router;
