const express = require("express");

const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  removeBatch,
  getRegistrationBatches,
  getTeacherBatches,
} = require("../controllers/batch.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// CREATE BATCH
// Super Admin and Admin
// ============================================================

router.post(
  "/",
  protect,
  authorizeRoles("super_admin", "admin"),
  createBatch
);

// ============================================================
// PUBLIC REGISTRATION BATCHES
// Keep before /:id
// ============================================================

router.get(
  "/registration",
  getRegistrationBatches
);

// ============================================================
// TEACHER'S ASSIGNED BATCHES
// ============================================================

router.get(
  "/teacher/my-batches",
  protect,
  authorizeRoles("teacher"),
  getTeacherBatches
);

// ============================================================
// GET ALL BATCHES
// ============================================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "super_admin",
    "admin",
    "teacher",
    "student"
  ),
  getBatches
);

// ============================================================
// GET SINGLE BATCH
// Super Admin only
// ============================================================

router.get(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  getBatchById
);

// ============================================================
// UPDATE BATCH
// Super Admin and Admin
// ============================================================

router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin", "admin"),
  updateBatch
);

// ============================================================
// REMOVE BATCH
// Super Admin only
// ============================================================

router.patch(
  "/:id/remove",
  protect,
  authorizeRoles("super_admin"),
  removeBatch
);

module.exports = router;