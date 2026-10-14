const express = require("express");

const {
  createBranch,
  getAllBranches,
  getActiveBranches,
  updateBranch
} = require("../controllers/branch.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create branch
router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createBranch
);

// Get all branches
router.get(
  "/",
  protect,
  authorizeRoles("super_admin"),
  getAllBranches
);

// Get active branches
router.get(
  "/active",
  protect,
  getActiveBranches
);

// Update branch
router.put(
  "/:id",
  protect,
  authorizeRoles("super_admin"),
  updateBranch
);


module.exports = router;