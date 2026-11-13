const express = require("express");

const router = express.Router();

const {
  getAcademicCalendarEvents,
  createAcademicCalendarEvent,
  updateAcademicCalendarEvent,
  deleteAcademicCalendarEvent,
} = require("../controllers/academicCalendar.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All Academic Calendar routes require authentication
router.use(protect);

// Allow student, teacher, admin, super_admin to view academic calendar
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAcademicCalendarEvents
);

// Only Super Admin and Admin can manage calendar events
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createAcademicCalendarEvent
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updateAcademicCalendarEvent
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAcademicCalendarEvent
);

module.exports = router;