const express = require("express");

const {
  assignSubjectToBatch,
  getBatchSubjects,
  changeTeacher,
  updateBatchSubjectStatus,
} = require("../controllers/batchSubject.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Assign subject to batch.
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  assignSubjectToBatch
);

// Fetch subjects for a batch.
// Teachers are restricted to their own active assignments.
router.get(
  "/batch/:batchId",
  protect,
  authorizeRoles(
    "super_admin",
    "admin",
    "teacher",
    "student"
  ),
  getBatchSubjects
);

// Change assigned teacher.
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  changeTeacher
);

// Activate or deactivate assignment.
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateBatchSubjectStatus
);

module.exports = router;