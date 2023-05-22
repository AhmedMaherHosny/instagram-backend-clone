const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { Post } = require("../models/Post");
const { User, validateCreateOrUpdateUser } = require("../models/User");
const { streamUpload } = require("../utils/functions");
const { imageSize, savedPath } = require("../constants");
const fs = require("fs");

/**
 *   @desc Get profile by id
 *   @route /api/profile/:id
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "user not found!" });
  }
  // user (_id username bio avatar) + num of (posts followers following) + follow button or unfollow + posts(_id imageOrVideoUrl)
  let posts = await Post.find({ postedBy: req.params.id })
    .sort({ createdAt: -1 })
    .select("_id imageOrVideoUrl");
  if (req.params.id === req.user.id) {
    const actualUserAndPosts = new (class {
      constructor() {
        this._id = user._id;
        this.username = user.username;
        this.bio = user.bio;
        this.avatar = user.avatar;
        this.isAdmin = user.isAdmin;
        this.isFollowing = null;
        this.isCurrentUser = true;
        this.numberOfFollowers = user.followers.length;
        this.numberOfFollowing = user.following.length;
        this.postList = posts;
      }
    })();
    return res.status(StatusCodes.OK).json(actualUserAndPosts);
  }
  const actualUserAndPosts = new (class {
    constructor() {
      this._id = user._id;
      this.username = user.username;
      this.bio = user.bio;
      this.avatar = user.avatar;
      this.isAdmin = user.isAdmin;
      this.isFollowing = user.followers && user.followers.includes(req.user.id);
      this.isCurrentUser = false;
      this.numberOfFollowers = user.followers.length;
      this.numberOfFollowing = user.following.length;
      this.postList = posts;
    }
  })();
  return res.status(StatusCodes.OK).json(actualUserAndPosts);
});

/**
 *   @desc Get posts profile by id
 *   @route /api/profile/:id/posts?page=1
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getProfilePostsById = asyncHandler(async (req, res) => {
  //await new Promise((resolve) => setTimeout(resolve, 5000));

  const { id } = req.params;
  const { page } = req.query;
  const PAGE_SIZE = 5;

  const skip = (page - 1) * PAGE_SIZE;

  const posts = await Post.find({ postedBy: id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE);

  const postsWithFirstImage = posts.map((post) => {
    const firstImageUrl = post.imageOrVideoUrl[0];
    const { _id } = post;
    return { _id, firstImageUrl };
  });

  res.status(StatusCodes.OK).json({ profilePosts: postsWithFirstImage });
});

/**
 *   @desc Edit profile
 *   @route /api/profile/edit
 *   @method Put
 *   @access private (must be authenticated and the email owner)
 **/
module.exports.editProfile = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user.id);
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found!" });
  }
  const { error } = validateCreateOrUpdateUser(req.body, false);
  const image = req.file;
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }

  if (!image) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Please select an image" });
  }
  user = await User.findOne({username : req.body.username});
  if (user && user.id != req.user.id){
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "This username already exist" });
  }

  const mediaResPromise = streamUpload(
    fs.readFileSync(image.path),
    imageSize.SMALL,
    savedPath.profiles
  );
  const mediaRes = await mediaResPromise;
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { 
      username: req.body.username, 
      avatar: mediaRes.secure_url
    },
    { new: true }
  ).select(
    "-firstName -lastName -password -followers -isOnline -lastIP -phoneNumber -createdAt -updatedAt -otpExpiresAt -__v"
  );

  return res.status(StatusCodes.OK).json({ user: updatedUser });
});
