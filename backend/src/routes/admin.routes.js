const express = require("express");

const {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  promoteTeacherToAdmin,
  getDashboardStats,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Dashboard Statistics for Admin and Super Admin
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("super_admin", "admin"),
  getDashboardStats
);

// Super Admin only
router.get(
  "/registrations",
  protect,
  authorizeRoles("super_admin"),
  getPendingRegistrations
);

router.patch(
  "/registrations/:id/approve",
  protect,
  authorizeRoles("super_admin"),
  approveRegistration
);

router.patch(
  "/registrations/:id/reject",
  protect,
  authorizeRoles("super_admin"),
  rejectRegistration
);

router.patch(
  "/users/:id/promote-to-admin",
  protect,
  authorizeRoles("super_admin"),
  promoteTeacherToAdmin
);

module.exports = router;