const express = require("express");
const router = express.Router();

const {
  createLectureLog,
  getLectureLogs,
  getLectureLogById,
  updateLectureLog,
} = require("../controllers/lectureLog.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All lecture log routes require authentication.
router.use(protect);

// Create a lecture log.
router.post(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  createLectureLog
);

// Get lecture logs.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getLectureLogs
);

// Get one lecture log.
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  getLectureLogById
);

// Update a lecture log.
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher"),
  updateLectureLog
);

module.exports = router;