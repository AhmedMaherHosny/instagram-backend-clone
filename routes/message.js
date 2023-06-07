const express = require("express");
const router = express.Router();
const {
  addMessage,
  getMessagesByChatId,
} = require("../controllers/message_controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../middlewares/verify_token");

// /api/message/
router.post("/", verifyToken, addMessage);

// /api/message/:id
router.get("/:id", verifyToken, getMessagesByChatId);

module.exports = router;
