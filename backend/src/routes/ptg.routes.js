const express = require("express");
const router = express.Router();

const {
  createPTG,
  getPTGMeetings,
  getTeacherPTGMeetings,
  getPTGStats,
  getPTGById,
  updatePTG,
  deletePTG,
  getPTGStudents,
  getPTGTeachers,
} = require("../controllers/ptg.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All PTG routes require authentication.
router.use(protect);

// Teacher: read-only PTG meetings assigned to the logged-in teacher.
router.get(
  "/teacher/meetings",
  authorizeRoles("teacher"),
  getTeacherPTGMeetings
);

// Create a PTG meeting.
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createPTG
);

// Retrieve dashboard statistics.
router.get(
  "/stats",
  authorizeRoles("super_admin", "admin"),
  getPTGStats
);

// Retrieve students for the meeting form.
router.get(
  "/students",
  authorizeRoles("super_admin", "admin"),
  getPTGStudents
);

// Retrieve teachers for the meeting form.
router.get(
  "/teachers",
  authorizeRoles("super_admin", "admin"),
  getPTGTeachers
);

// Retrieve all PTG meetings (students see their own, teachers see their own, admins see all).
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getPTGMeetings
);

// Retrieve one PTG meeting.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getPTGById
);

// Update a PTG meeting.
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updatePTG
);

// Delete a PTG meeting.
router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deletePTG
);

module.exports = router;
