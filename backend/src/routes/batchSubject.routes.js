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

// Super Admin and Admin can assign subjects; controller enforces branch access.
router.post("/", protect, authorizeRoles("super_admin", "admin"), assignSubjectToBatch);

// Authenticated users may read assignments only when permitted by controller checks.
router.get("/batch/:batchId", protect, getBatchSubjects);

// Super Admin and Admin can change teachers within authorized branches.
router.put("/:id", protect, authorizeRoles("super_admin", "admin"), changeTeacher);

// Super Admin and Admin can toggle assignment status within authorized branches.
router.patch("/:id/status", protect, authorizeRoles("super_admin", "admin"), updateBatchSubjectStatus);

module.exports = router;
