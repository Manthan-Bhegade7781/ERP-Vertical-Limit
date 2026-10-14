const express = require("express");

const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  updateTeacherStatus,
} = require("../controllers/teacher.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createTeacher
);

router.get(
  "/",
  protect,
  getTeachers
);

router.get(
  "/:id",
  protect,
  getTeacherById
);

router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateTeacher
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("super_admin"),
  updateTeacherStatus
);

module.exports = router;