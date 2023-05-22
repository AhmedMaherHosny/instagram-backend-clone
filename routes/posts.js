const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../middlewares/verify_token");
const {
  getAllPosts,
  createPost,
  deletePostById,
  getPostById,
  likePost,
  getPostsFromFollowing,
  commentOnPost,
  getCommentsByPostId,
  likeComment,
} = require("../controllers/post_comtroller");
const {multerConfig} = require("../utils/multer");
// /api/posts
router
  .route("/")
  .get(verifyTokenAndAdmin, getAllPosts)
  .post(verifyToken, multerConfig.array("images", 20), createPost);

// /api/posts/:id
router
  .route("/:id")
  //  .put(verifyTokenAndAuthorization, updateUser)
  .get(verifyToken, getPostById)
  .delete(verifyToken, deletePostById)
  .patch(verifyToken, commentOnPost);

// /api/posts/like/:id
router.route("/like/:id").patch(verifyToken, likePost);

// /api/posts/explore/get-following-posts
router
  .route("/explore/get-following-posts")
  .get(verifyToken, getPostsFromFollowing);

// /api/posts/comments/:id
router.route("/comments/:id").get(verifyToken, getCommentsByPostId);

// /api/posts/like/comments/:id
router.route("/like/comments/:id").patch(verifyToken, likeComment);

module.exports = router;
