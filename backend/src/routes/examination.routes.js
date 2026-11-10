const express = require("express");
const router = express.Router();

const {
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  cancelExamination,
  rescheduleExamination,
} = require("../controllers/examination.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);

// Create examination
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createExamination
);

// Get examinations
router.get("/", getExaminations);

// Get examination by ID
router.get(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  getExaminationById
);

// Update examination details
router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updateExamination
);

// Cancel examination
router.patch(
  "/:id/cancel",
  authorizeRoles("super_admin", "admin"),
  cancelExamination
);

// Schedule a cancelled examination again
router.patch(
  "/:id/reschedule",
  authorizeRoles("super_admin", "admin"),
  rescheduleExamination
);

module.exports = router;