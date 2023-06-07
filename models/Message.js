const mongoose = require("mongoose");
const Joi = require("joi");
const Chat = require("../models/Chat");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1 });

messageSchema.post("save", async function (doc) {
  await Chat.updateOne(
    { _id: doc.chatId },
    { $set: { latestMessage: doc._id } }
  );
});

const Message = mongoose.model("Message", messageSchema);

// Validate Create Message
function validateMessage(message) {
  const messageValidationSchema = Joi.object({
    chatId: Joi.required(),
    content: Joi.string().required().trim().min(1),
  });
  return messageValidationSchema.validate(message);
}

module.exports = {
  Message,
  validateMessage,
};
