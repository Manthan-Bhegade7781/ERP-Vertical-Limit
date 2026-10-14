
const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  getMessageRecipients,
} = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/message-recipients",
  protect,
  getMessageRecipients
);

module.exports = router;
