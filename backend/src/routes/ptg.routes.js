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

router.use(protect);

// Teacher: read-only PTG meetings assigned to the logged-in teacher.
router.get(
  "/teacher/meetings",
  authorizeRoles("teacher"),
  getTeacherPTGMeetings
);

// Admin / Super Admin management routes.
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createPTG
);

router.get(
  "/stats",
  authorizeRoles("super_admin", "admin"),
  getPTGStats
);

router.get(
  "/students",
  authorizeRoles("super_admin", "admin"),
  getPTGStudents
);

router.get(
  "/teachers",
  authorizeRoles("super_admin", "admin"),
  getPTGTeachers
);

router.get(
  "/",
  authorizeRoles("super_admin", "admin"),
  getPTGMeetings
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  getPTGById
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updatePTG
);

router.delete(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  deletePTG
);

module.exports = router;