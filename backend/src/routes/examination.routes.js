
const express = require("express");
const router = express.Router();

const {
  createExamination,
  getExaminations,
  getExaminationById,
  updateExamination,
  cancelExamination,
} = require("../controllers/examination.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(protect);

// Super Admin examination management
router.post(
  "/",
  authorizeRoles("super_admin"),
  createExamination
);

router.get(
  "/",
  authorizeRoles("super_admin"),
  getExaminations
);

router.get(
  "/:id",
  authorizeRoles("super_admin"),
  getExaminationById
);

router.put(
  "/:id",
  authorizeRoles("super_admin"),
  updateExamination
);

router.patch(
  "/:id/cancel",
  authorizeRoles("super_admin"),
  cancelExamination
);

module.exports = router;
