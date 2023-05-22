const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

// Validate Create Or Update Comment
function validateCreateOrUpdateComment(comment, isCreate) {
  if (isCreate) {
    const commentValidationSchema = Joi.object({
      comment: Joi.string().trim().min(1).required(),
    });
    return commentValidationSchema.validate(comment);
  } else {
    const commentValidationSchema = Joi.object({
      comment: Joi.string().trim().min(1),
    });
    return commentValidationSchema.validate(comment);
  }
}

module.exports = {
  Comment,
  validateCreateOrUpdateComment,
};
