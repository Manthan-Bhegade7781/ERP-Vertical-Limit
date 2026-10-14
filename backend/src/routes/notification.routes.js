const express = require("express");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All notification endpoints require authentication
router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);

router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

module.exports = router;