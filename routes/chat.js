const express = require("express");
const router = express.Router();
const {
  createChat,
  getAllUserChats,
  isChatExist,
} = require("../controllers/chat_controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../middlewares/verify_token");

// /api/chat/
router.get("/", verifyToken, getAllUserChats);

// /api/chat/find/:id
router.get("/find/:id", verifyToken, isChatExist);

// /api/chat/:id
router.post("/:id", verifyToken, createChat);

module.exports = router;
