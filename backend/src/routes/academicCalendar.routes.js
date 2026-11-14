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

// All Academic Calendar routes require authentication.
router.use(protect);

// ==========================================
// GET: View academic calendar events
// Allowed: Super Admin, Admin, Teacher, Student
// ==========================================
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getAcademicCalendarEvents
);

// ==========================================
// POST: Create academic calendar event
// Allowed: Super Admin, Admin
// ==========================================
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createAcademicCalendarEvent
);

// ==========================================
// PUT: Update academic calendar event
// Allowed: Super Admin, Admin
// ==========================================
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updateAcademicCalendarEvent
);

// ==========================================
// DELETE: Soft-delete academic calendar event
// Allowed: Super Admin, Admin
// ==========================================
router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deleteAcademicCalendarEvent
);

module.exports = router;
