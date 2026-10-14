
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  duplicateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcement.controller");

// View announcements
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAnnouncements
);

// Create announcement
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  createAnnouncement
);

// Update announcement details
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateAnnouncement
);

// Publish, schedule, expire, or return to draft
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateAnnouncementStatus
);

// Duplicate announcement
router.post(
  "/:id/duplicate",
  protect,
  authorizeRoles("super_admin", "admin"),
  duplicateAnnouncement
);

// Delete announcement
router.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  deleteAnnouncement
);

module.exports = router;
