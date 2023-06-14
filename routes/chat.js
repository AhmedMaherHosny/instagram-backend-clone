const express = require("express");
const router = express.Router();
const {
  createChat,
  getAllUserChats,
} = require("../controllers/chat_controller");
const { verifyToken } = require("../middlewares/verify_token");

// /api/chat/
router.get("/", verifyToken, getAllUserChats);

// /api/chat/:id
router.post("/:id", verifyToken, createChat);

module.exports = router;
