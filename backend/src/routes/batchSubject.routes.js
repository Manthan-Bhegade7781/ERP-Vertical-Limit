const express = require("express");

const {
  assignSubjectToBatch,
  getBatchSubjects,
  changeTeacher,
  updateBatchSubjectStatus
} = require("../controllers/batchSubject.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Assign subject to batch
router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  assignSubjectToBatch
);

// Get all subjects assigned to a batch
router.get(
  "/batch/:batchId",
  protect,
  getBatchSubjects
);

// Change teacher
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  changeTeacher
);

// Activate / deactivate assignment
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin"),
  updateBatchSubjectStatus
);

module.exports = router;