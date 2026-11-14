const express = require("express");
const router = express.Router();

const {
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  cancelExamination,
  rescheduleExamination,
  getStudentResults,
  submitTestResult,
} = require("../controllers/examination.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);

// Student routes (must come before /:id)
router.get("/my/results", getStudentResults);
router.post("/my/submit", submitTestResult);

// Examinations list (Admin, Super Admin, Teacher, Student)
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getExaminations
);

// Admin / Super Admin management routes
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createExamination
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getExaminationById
);

router.put(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updateExamination
);

router.patch(
  "/:id/cancel",
  authorizeRoles("super_admin", "admin"),
  cancelExamination
);

router.patch(
  "/:id/reschedule",
  authorizeRoles("super_admin", "admin"),
  rescheduleExamination
);

module.exports = router;
