const express = require("express");

const {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("super_admin"));

router.get("/registrations", getPendingRegistrations);

router.patch(
  "/registrations/:id/approve",
  approveRegistration
);

router.patch(
  "/registrations/:id/reject",
  rejectRegistration
);

module.exports = router;