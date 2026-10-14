
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

router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getMessages
);

router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  createMessage
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getMessageById
);

router.post(
  "/:id/reply",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  replyToMessage
);

router.patch(
  "/:id/status",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  updateMessageStatus
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  deleteMessage
);

module.exports = router;
