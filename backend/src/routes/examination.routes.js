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

// Teachers can only view examinations assigned to them.
router.get(
  "/",
  authorizeRoles("super_admin", "admin", "teacher"),
  getExaminations
);

// Admin / Super Admin management routes.
router.post(
  "/",
  authorizeRoles("super_admin", "admin"),
  createExamination
);

router.get(
  "/:id",
  authorizeRoles("super_admin", "admin"),
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