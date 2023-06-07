const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/verify_token");
const {
  getProfileById,
  getProfilePostsById,
  editProfile,
  getUserHeaderById,
} = require("../controllers/profile_controller");
const { multerConfigProfile } = require("../utils/multer");

// /api/profile/:id
router.route("/:id").get(verifyToken, getProfileById);

// /api/profile/:id/posts
router.route("/:id/posts").get(verifyToken, getProfilePostsById);

// /api/profile/edit
router
  .route("/edit")
  .put(verifyToken, multerConfigProfile.single("image"), editProfile);

// /api/profile/header/:id
router.route("/header/:id").get(verifyToken, getUserHeaderById);

module.exports = router;
