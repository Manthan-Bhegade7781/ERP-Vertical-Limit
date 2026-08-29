const express = require("express");

const {
  createBranch,
} = require("../controllers/branch.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  createBranch
);

module.exports = router;