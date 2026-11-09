const express = require("express");
const router = express.Router();

const {
  createPTG,
  getPTGMeetings,
  getPTGStats,
  getPTGById,
  updatePTG,
  deletePTG,
  getPTGStudents,
  getPTGTeachers,
} = require("../controllers/ptg.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All PTG routes require authentication and Super Admin access.
router.use(protect);
router.use(authorizeRoles("super_admin","admin"));

// Create a PTG meeting.
router.post("/", createPTG);

// Retrieve dashboard statistics.
router.get("/stats", getPTGStats);

// Retrieve students for the meeting form.
router.get("/students", getPTGStudents);

// Retrieve teachers for the meeting form.
router.get("/teachers", getPTGTeachers);

// Retrieve all PTG meetings.
router.get("/", getPTGMeetings);

// Retrieve one PTG meeting.
router.get("/:id", getPTGById);

// Update a PTG meeting.
router.put("/:id", updatePTG);

// Delete a PTG meeting.
router.delete("/:id", deletePTG);

module.exports = router;