const express = require("express");

const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  removeBatch,
  getRegistrationBatches,
} = require("../controllers/batch.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create batch — Super Admin only
router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createBatch
);

// Public batches for the registration form
// IMPORTANT: Keep this before router.get("/:id")
router.get("/registration", getRegistrationBatches);

// Get all active/non-removed batches — authenticated users
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getBatches
);

// Get single batch — Super Admin only
router.get(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  getBatchById
);

// Update batch — Super Admin only
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateBatch
);

// Soft remove batch — Super Admin only
router.patch(
  "/:id/remove",
  protect,
  authorizeRoles("super_admin"),
  removeBatch
);

module.exports = router;
