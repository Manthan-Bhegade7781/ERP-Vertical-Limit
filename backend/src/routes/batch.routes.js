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

// Create batch — Super Admin only (outside Admin Batches scope)
router.post("/", protect, authorizeRoles("super_admin","admin"), createBatch);

// Public batches for registration. Keep before /:id.
router.get("/registration", getRegistrationBatches);

// Authenticated users; controller scopes Admin results to their branch.
router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "admin", "teacher", "student"),
  getBatches
);

// Single batch remains Super Admin-only for now.
router.get("/:id", protect, authorizeRoles("super_admin"), getBatchById);

// Super Admin and Admin can update; controller enforces Admin branch scope.
router.put("/:id", protect, authorizeRoles("super_admin", "admin"), updateBatch);

// Remove batch — Super Admin only (outside Admin Batches scope)
router.patch("/:id/remove", protect, authorizeRoles("super_admin"), removeBatch);

module.exports = router;
