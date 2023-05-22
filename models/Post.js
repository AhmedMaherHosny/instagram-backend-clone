const mongoose = require("mongoose");
const Joi = require("joi");
const postSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageOrVideoUrl: [
      {
        type: String,
        required: true,
      },
    ],
    caption: {
      type: String,
      trim: true,
      default: null,
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Comment",
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"], // Don't forget to specify the type as "Point" for GeoJSON
      },
      coordinates: {
        type: [Number],
      },
    },
    hashtags: [String],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

postSchema.pre("save", function (next) {
  if (this.caption) {
    const regex = /#(\w+)/g; // regular expression to match hashtags
    const hashtags = this.caption.match(regex); // extract hashtags from the caption
    if (hashtags && hashtags.length > 0) {
      // remove the '#' symbol and convert to lowercase
      this.hashtags = hashtags.map((tag) => tag.slice(1).toLowerCase());
      // remove duplicates
      this.hashtags = [...new Set(this.hashtags)];
    }
  }
  next();
});

postSchema.pre("findByIdAndUpdate", function (next) {
  if (this.caption) {
    const regex = /#(\w+)/g; // regular expression to match hashtags
    const hashtags = this.caption.match(regex); // extract hashtags from the caption
    if (hashtags && hashtags.length > 0) {
      // remove the '#' symbol and convert to lowercase
      this.hashtags = hashtags.map((tag) => tag.slice(1).toLowerCase());
      // remove duplicates
      this.hashtags = [...new Set(this.hashtags)];
    }
  }
  next();
});

postSchema.index({ hashtags: 1 });
postSchema.index({ location: 2 });

const Post = mongoose.model("Post", postSchema);

// Validate Create Post
function validateCreatePost(post) {
  const locationSchema = Joi.object({
    type: Joi.string().valid("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2),
  });
  const postValidationSchema = Joi.object({
    caption : Joi.string().optional(),
    tags : Joi.array().items(Joi.string()).optional(),
    location: locationSchema,
  });
  return postValidationSchema.validate(post);
}

module.exports = {
  Post,
  validateCreatePost,
};
