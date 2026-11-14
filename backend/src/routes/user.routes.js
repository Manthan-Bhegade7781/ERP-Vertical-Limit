const express = require("express");

const {
  getAllUsers,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getMessageRecipients,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// All users require authentication
router.use(protect);

// =====================================================
// MESSAGE RECIPIENTS
// =====================================================

router.get(
  "/message-recipients",
  getMessageRecipients
);

// =====================================================
// SUPER ADMIN USER MANAGEMENT
// =====================================================

router.get(
  "/",
  authorizeRoles("super_admin"),
  getAllUsers
);

router.post(
  "/",
  authorizeRoles("super_admin"),
  createUser
);

router.put(
  "/:id",
  authorizeRoles("super_admin"),
  updateUser
);

router.patch(
  "/:id/role",
  authorizeRoles("super_admin"),
  updateUserRole
);

router.patch(
  "/:id/status",
  authorizeRoles("super_admin"),
  updateUserStatus
);

router.delete(
  "/:id",
  authorizeRoles("super_admin"),
  deleteUser
);

module.exports = router;