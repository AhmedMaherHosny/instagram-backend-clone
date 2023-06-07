const asyncHandler = require("express-async-handler");
const { Message, validateMessage } = require("../models/Message");
const { StatusCodes } = require("http-status-codes");

/**
 *   @desc add message
 *   @route /api/message/
 *   @method Post
 *   @access private (must be authenticated)
 **/
module.exports.addMessage = asyncHandler(async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  const newMessage = new Message({
    chatId: req.body.chatId,
    senderId: req.user.id,
    content: req.body.content,
  });
  const message = await newMessage.save();
  res.status(StatusCodes.OK).json({ message });
});

/**
 *   @desc get messages by chat Id
 *   @route /api/message/:id
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getMessagesByChatId = asyncHandler(async (req, res) => {
  const message = await Message.find({ chatId: req.params.id });
  res.status(StatusCodes.OK).json({ message });
});
