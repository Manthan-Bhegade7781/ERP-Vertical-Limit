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

// Teachers can view assigned assignments.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAssignments
);

// Teachers can download attachments for their assigned assignments.
router.get(
  "/:id/attachment",
  authorizeRoles("super_admin", "admin", "teacher"),
  downloadAssignmentAttachment
);

// View individual assignment.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getAssignmentById
);

// Only Admin / Super Admin can create, edit, or delete assignments.
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  uploadAssignmentPDF,
  createAssignment
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  uploadAssignmentPDF,
  updateAssignment
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAssignment
);

module.exports = router;