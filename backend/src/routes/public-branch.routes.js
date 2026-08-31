const express = require("express");

const {
  getActiveBranches,
} = require("../controllers/branch.controller");

const router = express.Router();

// Public: used during registration
router.get("/", getActiveBranches);

module.exports = router;