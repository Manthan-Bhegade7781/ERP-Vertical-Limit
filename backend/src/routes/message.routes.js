const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const {
  getMessages,
  createMessage,
  getMessageById,
  replyToMessage,
  updateMessageStatus,
  deleteMessage,
} = require("../controllers/message.controller");

router.use(protect);

// Admin, Super Admin and Teachers can view their permitted inbox.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getMessages
);

// Open permitted message details.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getMessageById
);

// Compose messages.
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  createMessage
);

// Both Teachers and Admin/Super Admin can reply.
router.post(
  "/:id/reply",
  authorizeRoles("super_admin", "admin", "teacher"),
  replyToMessage
);

// Only Admin and Super Admin can manage messages.
router.use(authorizeRoles("super_admin", "admin"));

router.patch("/:id/status", updateMessageStatus);
router.delete("/:id", deleteMessage);

module.exports = router;