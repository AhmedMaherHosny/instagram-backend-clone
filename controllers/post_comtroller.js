const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");
const { Post, validateCreatePost } = require("../models/Post");
const { User } = require("../models/User");
const { Comment, validateCreateOrUpdateComment } = require("../models/Comment");
const {streamUpload} = require("../utils/functions");
const {imageSize,savedPath} = require("../constants");
const fs = require("fs");
/**
 *   @desc Get all posts
 *   @route /api/posts
 *   @method Get
 *   @access private (Admins only)
 **/
module.exports.getAllPosts = asyncHandler(async (req, res) => {
  let posts = await Post.find({})
    .select("-__v -hashtags")
    .sort({ createdAt: -1 })
    .populate("postedBy", "_id username avatar");
  // Populate tags field only if it's not empty
  if (posts.some((post) => post.tags && post.tags.length > 0)) {
    posts = await Post.populate(posts, {
      path: "tags",
      select: "_id username",
    });
  }

  // Populate comments field only if it's not empty
  if (posts.some((post) => post.comments && post.comments.length > 0)) {
    posts = await Post.populate(posts, {
      path: "comments",
      select: "_id postedBy",
      populate: {
        path: "postedBy",
        select: "_id username avatar",
      },
    });
  }
  res.status(StatusCodes.OK).json({ posts });
});

/**
 *   @desc Create post
 *   @route /api/posts
 *   @method Post
 *   @access private (must be authenticated)
 **/
module.exports.createPost = asyncHandler(async (req, res) => {
  const { error } = validateCreatePost(req.body);
  const pictureFiles = req.files;
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  if (!pictureFiles || pictureFiles.length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "please select at least one image or video" });
  }
  const mediaResPromises = pictureFiles.map((file) => streamUpload(fs.readFileSync(file.path), imageSize.LARGE, savedPath.posts));
  const mediaRes = await Promise.all(mediaResPromises);
  const post = Post({
    postedBy: req.user.id,
    imageOrVideoUrl: mediaRes.map((result) => result.secure_url),
    caption: req.body.caption,
    location: req.body.location,
    tags: req.body.tags,
  });
  const result = await post.save();
  const { __v, ...other } = result._doc;
  res.status(StatusCodes.CREATED).json({ ...other });
});

/**
 *   @desc Get post by id
 *   @route /api/posts/:id
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getPostById = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id)
    .populate("postedBy", "_id username avatar")
    .select("-__v -hashtags");

  // Populate tags field only if it's not empty
  if (post.tags && post.tags.length > 0) {
    post = await Post.populate(post, {
      path: "tags",
      select: "_id username",
    });
  }

  // Populate comments field only if it's not empty
  if (post.comments && post.comments.length > 0) {
    post = await Post.populate(post, {
      path: "comments",
      select: "_id postedBy",
      populate: {
        path: "postedBy",
        select: "_id username avatar",
      },
    });
  }

  res.status(StatusCodes.OK).json({ post });
});

/**
 *   @desc Delete post by id
 *   @route /api/posts/:id
 *   @method Delete
 *   @access private (the author and the admin only)
 **/
module.exports.deletePostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(StatusCodes.OK).json({ message: "Not found!" });
  }
  if (req.user.id !== post.postedBy.toString() && !req.user.isAdmin) {
    return res.status(StatusCodes.OK).json({ message: "You are not allowed!" });
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ message: "Post deleted successfully" });
});

/**
 *   @desc like post
 *   @route /api/posts/like/:id
 *   @method Patch
 *   @access private (must be authenticated)
 **/
module.exports.likePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Not found!" });
  }
  if (post.likes.includes(req.user.id)) {
    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user.id },
      },
      { new: true }
    ).select("-__v");
    return res.status(StatusCodes.OK).json({ message: "like removed" });
  }
  post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: { likes: req.user.id },
    },
    { new: true }
  ).select("-__v");
  res.status(StatusCodes.OK).json({ message: "like sent" });
});

/**
 *   @desc Get posts from user following
 *   @route /api/posts/explore/get-following-posts?page=1
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getPostsFromFollowing = asyncHandler(async (req, res) => {
  //await new Promise((resolve) => setTimeout(resolve, 5000));

  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  let followingPosts = await Post.find({
    postedBy: { $in: req.user.following },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("postedBy", "_id username avatar")
    .select("-__v -hashtags");

  followingPosts = followingPosts.map((data, index) => {
    return { ...data._doc, liked: data.likes.includes(req.user.id) };
  });

  res.status(StatusCodes.OK).json({ followingPosts });
});

/**
 *   @desc Comment on post
 *   @route /api/posts/:id
 *   @method Patch
 *   @access private (must be authenticated)
 **/
module.exports.commentOnPost = asyncHandler(async (req, res) => {
  const { error } = validateCreateOrUpdateComment(req.body, true);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  const comment = Comment({
    postId: req.params.id,
    postedBy: req.user.id,
    comment: req.body.comment,
  });
  const result = await comment.save();
  const { _id } = result._doc;
  const addedComment = await Comment.findById(_id)
    .select("-__v -updatedAt -postId")
    .populate("postedBy", "_id username avatar");
  await Post.findByIdAndUpdate(req.params.id, {
    $push: { comments: _id },
  });
  const responseComment = { ...addedComment._doc, liked: false };
  res.status(StatusCodes.OK).json({ comment: responseComment });
});

/**
 *   @desc Get comments by postId with pagination
 *   @route /api/posts/comments/:id?page=1
 *   @method Get
 *   @access private (must be authenticated)
 **/
module.exports.getCommentsByPostId = asyncHandler(async (req, res) => {
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  let post = await Post.findById(req.params.id);
  if (!post) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "post not found!" });
  }

  const totalComments = post.comments.length;

  if (post.comments && totalComments > 0) {
    post = post.toObject(); // convert to Mongoose document
    post = await Post.populate(post, {
      path: "comments",
      select: "_id comment likes createdAt postedBy",
      populate: {
        path: "postedBy",
        select: "_id username avatar",
      },
    });
  }

  post.comments = post.comments.map((comment) => {
    const isLiked = comment.likes && comment.likes.includes(req.user.id);
    return {
      ...comment._doc,
      liked: isLiked || false,
    };
  });

  const paginatedComments = post.comments.slice(skip, skip + limit);

  res.status(StatusCodes.OK).json({ comments: paginatedComments });
});

/**
 *   @desc like comment
 *   @route /api/posts/like/comments/:id
 *   @method Patch
 *   @access private (must be authenticated)
 **/
module.exports.likeComment = asyncHandler(async (req, res) => {
  let comment = await Comment.findById(req.params.id);
  if (comment == null) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "Comment not found!" });
  }
  if (comment.likes.includes(req.user.id)) {
    comment = await Comment.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { likes: req.user.id },
      },
      { new: true }
    );
  } else {
    comment = await Comment.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: { likes: req.user.id },
      },
      { new: true }
    );
  }
  res.status(StatusCodes.OK).json({ message: "done" });
});
