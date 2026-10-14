
const express = require("express");

const {
  createTimetable,
  getTimetable,
  updateTimetable,
  removeTimetable,
} = require("../controllers/timetable.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create a timetable entry
router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  createTimetable
);

// Get timetable entries for the logged-in user's permitted scope
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getTimetable
);

// Update a timetable entry
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateTimetable
);

// Soft-remove a timetable entry
router.delete(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  removeTimetable
);

module.exports = router;
