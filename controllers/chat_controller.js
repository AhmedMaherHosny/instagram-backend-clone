const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");

/**
 *   @desc create chat
 *   @route /api/chat/:id
 *   @method Post
 *   @access private (must be authenticated)
 **/
module.exports.createChat = asyncHandler(async (req, res) => {
  const existingChat = await Chat.findOne({
    members: { $all: [req.user.id, req.params.id] },
  });
  if (existingChat) {
    res.status(StatusCodes.OK).json({ chat: existingChat });
  } else {
    const newChat = new Chat({
      members: [req.user.id, req.params.id],
    });
    const chat = await newChat.save();
    res.status(StatusCodes.CREATED).json({ chat });
  }
});

/**
 *   @desc get all user chats
 *   @route /api/chat
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getAllUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({
    members: { $in: [req.user.id] },
  })
    .populate({
      path: "members",
      select: "username avatar isOnline",
      match: { _id: { $ne: req.user.id } },
    })
    .populate({
      path: "latestMessage",
      select: "_id content createdAt",
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

  res.status(StatusCodes.OK).json({ chats });
});
