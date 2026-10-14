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

// Only Super Admin and Admin can manage calendar events
router.use(authorizeRoles("super_admin", "admin"));

// Get all events, with optional search and filters
router.get("/", getAcademicCalendarEvents);

// Create a new event
router.post("/", createAcademicCalendarEvent);

// Update an existing event
router.put("/:id", updateAcademicCalendarEvent);

// Soft-delete an event
router.delete("/:id", deleteAcademicCalendarEvent);

module.exports = router;