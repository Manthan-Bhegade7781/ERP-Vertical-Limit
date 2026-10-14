const express = require("express");

const {
  createSubject,
  getSubjects,
  updateSubject,
  updateSubjectStatus
} = require("../controllers/subject.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create subject — Super Admin only
router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createSubject
);

// View subjects — Any authenticated user
router.get(
  "/",
  protect,
  getSubjects
);

// Update subject — Super Admin only
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateSubject
);

// Update subject status — Super Admin only
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin"),
  updateSubjectStatus
);

module.exports = router;