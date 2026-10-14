const express = require("express");

const {
  enrollStudentInSubject,
  getStudentSubjects,
  getStudentsByBatchSubject,
  updateStudentSubjectStatus,
} = require("../controllers/studentSubject.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Enroll a student in a subject
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  enrollStudentInSubject
);

// Get subjects enrolled by a student
router.get(
  "/student/:studentId",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  getStudentSubjects
);

// Get students enrolled in a batch-subject assignment
router.get(
  "/batch-subject/:batchSubjectId/students",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  getStudentsByBatchSubject
);

// Activate or deactivate a student subject enrollment
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateStudentSubjectStatus
);

module.exports = router;
