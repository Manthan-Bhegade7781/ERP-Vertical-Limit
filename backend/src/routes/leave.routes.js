
const express = require("express");

const {
  getLeaveStaffOptions,
  getLeaves,
  createLeave,
  updateLeaveStatus,
  updateLeave,
  deleteLeave,
} = require("../controllers/leave.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Staff selection is only for Super Admin and Admin.
router.get(
  "/staff-options",
  protect,
  authorizeRoles("super_admin", "admin"),
  getLeaveStaffOptions
);

// Super Admin/Admin see permitted staff leave.
// Teachers will see only their own leave after controller updates.
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  getLeaves
);

// Super Admin/Admin can create leave for staff.
// Teachers can apply for themselves.
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  createLeave
);

// Only Super Admin/Admin can approve or reject.
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateLeaveStatus
);

// Super Admin/Admin can edit permitted pending requests.
// Teachers can edit their own pending requests.
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  updateLeave
);

// Super Admin/Admin can delete permitted pending requests.
// Teachers can delete their own pending requests.
router.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin", "teacher"),
  deleteLeave
);

module.exports = router;
