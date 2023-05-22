const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const { User, validateCreateOrUpdateUser } = require("../models/User");

/**
 *   @desc Update user
 *   @route /api/users/:id
 *   @method Put
 *   @access private
 **/
module.exports.updateUser = asyncHandler(async (req, res) => {
  const { error } = validateCreateOrUpdateUser(req.body, false);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  if (req.body.password) {
    const salt = await bcryptjs.genSalt(10);
    req.body.password = await bcryptjs.hash(req.body.password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
      },
    },
    { new: true }
  ).select("-password");
  res.status(StatusCodes.OK).json(updatedUser);
});

/**
 *   @desc Get all users
 *   @route /api/users/
 *   @method Get
 *   @access private (only admin)
 **/
module.exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(StatusCodes.OK).json(users);
});

/**
 *   @desc Get user by id
 *   @route /api/users/:id
 *   @method Get
 *   @access private (only admin and the account owner)
 **/
module.exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found!" });
  }
  res.status(StatusCodes.OK).json(user);
});

/**
 *   @desc Get current user
 *   @route /api/users/current-user
 *   @method Get
 *   @access private (the account owner)
 **/
module.exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-firstName -lastName -password -followers -isOnline -lastIP -phoneNumber -createdAt -updatedAt -otpExpiresAt -__v"
  );
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found!" });
  }
  res.status(StatusCodes.OK).json(user);
});

/**
 *   @desc Delete user by id
 *   @route /api/users/:id
 *   @method Delte
 *   @access private (only admin and the account owner)
 **/
module.exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found!" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ message: "user deleted succsefully!" });
});

/**
 *   @desc Follow user
 *   @route /api/users/follow-user/:id
 *   @method Patch
 *   @access private (must be authenticating)
 **/
module.exports.followUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const currentId = req.user.id; // * req.user.id it's the user that who wanted to follow someone (got it from the token)
  // * Check if the userID exists in the followingIds list
  if (req.user.following && req.user.following.includes(id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You already followed this person!" });
  }
  let user;
  // * add in follower
  user = await User.findByIdAndUpdate(
    id,
    {
      $push: { followers: currentId },
    },
    {
      new: true,
    }
  );
  // * add in following
  user = await User.findByIdAndUpdate(
    currentId,
    {
      $push: { following: id },
    },
    { new: true }
  );
  user = await User.findById(currentId).select(
    "-firstName -lastName -password -isEmailVerified -lastIP -phoneNumber -createdAt -updatedAt -otpExpiresAt -__v"
  );
  const token = user.generateToken();
  res.status(StatusCodes.OK).json({
    user: {
      ...user.toObject(),
      token: token,
    },
  });
});

/**
 *   @desc Unfollow user
 *   @route /api/users/unfollow-user/:id
 *   @method Patch
 *   @access private (must be authenticating)
 **/
module.exports.unFollowUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const currentId = req.user.id; // * req.user.id it's the user that who wanted to follow someone (got it from the token)
  // * Check if the userID not exists in the followingIds list
  if (req.user.following && !req.user.following.includes(id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "This person is not in your following list!" });
  }
  let user;
  // * remove from follower
  user = await User.findByIdAndUpdate(
    id,
    {
      $pull: { followers: currentId },
    },
    {
      new: true,
    }
  );
  // * remove from following
  user = await User.findByIdAndUpdate(
    currentId,
    {
      $pull: { following: id },
    },
    { new: true }
  );
  user = await User.findById(currentId).select(
    "-firstName -lastName -password -isEmailVerified -lastIP -phoneNumber -isAdmin -createdAt -updatedAt -otpExpiresAt -__v"
  );
  const token = user.generateToken();
  res.status(StatusCodes.OK).json({
    user: {
      ...user.toObject(),
      token: token,
    },
  });
});

/**
 *   @desc Search user
 *   @route /api/users/search?q=
 *   @method Get
 *   @access private (must be authenticating)
 **/
module.exports.searchUser = asyncHandler(async (req, res) => {
  const currentId = req.user.id 
  const q = req.query.q.trim();
  if (!q) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You must enter username to search for it!" });
  }
  const users = await User.find({
    _id: { $ne: currentId }, // Exclude the current user
    username: { $regex: q, $options: "i" },
  }).select(
    "-password -email -bio -lastSeen -isOnline -followers -following -isEmailVerified -lastIP -phoneNumber -createdAt -updatedAt -otpExpiresAt -__v"
  );
  if (users.length === 0) {
    return res.status(StatusCodes.OK).json({ message: "Nothing found!" });
  }
  res.status(StatusCodes.OK).json({ users });
});
