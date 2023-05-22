const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity"); // len <= 8 && one or less lower case && ~ ~ ~ upper case && ~ ~ ~ symbol

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dlgwcggdv/image/upload/v1679316402/default_avatar_pj7vbk.png",
    },
    lastIP: {
      type: String,
      trim: true,
      default: "192.168.1.1",
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: true,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 250,
    },
    followers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      default: () => Date.now() + 5 * 60 * 1000, // 5 minutes from now
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      following: this.following,
      isAdmin : this.isAdmin
    },
    process.env.JWT_SECRET_KEY
  );
};

// Validate Create Or Update User
function validateCreateOrUpdateUser(user, isCreate) {
  if (isCreate) {
    const userValidationSchema = joi.object({
      username: joi.string().trim().min(3).max(30).required(),
      email: joi.string().email().required(),
      firstName: joi.string().trim().min(3).max(30).required(),
      lastName: joi.string().trim().min(3).max(30).required(),
      password: passwordComplexity().required(),
      phoneNumber: joi.string().trim().required(),
      bio: joi.string().trim().max(250),
    });
    return userValidationSchema.validate(user);
  } else {
    const userValidationSchema = joi.object({
      username: joi.string().trim().min(3).max(30),
      email: joi.string().email(),
      password: passwordComplexity(),
      phoneNumber: joi.string().trim(),
      bio: joi.string().trim().max(250),
    });
    return userValidationSchema.validate(user);
  }
}

// Validate Login User
function validateLoginUser(user) {
  const userValidationSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().trim().min(8).required(),
  });
  return userValidationSchema.validate(user);
}

// Validate Change Password
function validateChangePassword(user) {
  const schema = joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(user);
}

const User = mongoose.model("User", userSchema);
module.exports = {
  User,
  validateCreateOrUpdateUser,
  validateLoginUser,
  validateChangePassword,
};
