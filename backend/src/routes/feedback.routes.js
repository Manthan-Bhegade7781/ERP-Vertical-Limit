const express = require("express");
const router = express.Router();

const {
  submitFeedback,
  getFeedback,
  getMyFeedback,
  updateFeedbackStatus,
  deleteFeedback
} = require("../controllers/feedback.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All feedback routes require authentication.
router.use(protect);

// Students can submit feedback.
router.post(
  "/",
  authorizeRoles("student"),
  submitFeedback
);

// Students can view their own feedback history.
router.get(
  "/my",
  authorizeRoles("student"),
  getMyFeedback
);

// Only Admin and Super Admin can view all feedback.
router.get(
  "/",
  authorizeRoles("super_admin", "admin"),
  getFeedback
);

// Only Admin and Super Admin can update feedback status.
router.patch(
  "/:id/status",
  authorizeRoles("super_admin", "admin"),
  updateFeedbackStatus
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteFeedback
);

module.exports = router;