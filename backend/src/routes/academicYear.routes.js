const express = require("express");

const {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear
} = require("../controllers/academicYear.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create academic year
router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createAcademicYear
);

// Get all academic years
router.get(
  "/",
  protect,
  getAcademicYears
);

// Update academic year
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateAcademicYear
);

module.exports = router;