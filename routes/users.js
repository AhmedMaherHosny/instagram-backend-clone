const express = require("express");
const router = express.Router();
const {
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  followUser,
  unFollowUser,
  searchUser,
  getCurrentUser,
} = require("../controllers/user_controller");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verify_token");

// /api/users
router.get("/", verifyTokenAndAdmin, getAllUsers);

// /api/users/current-user
router.get("/current-user", verifyToken, getCurrentUser);

// /api/users/search?q=
router.route("/search").get(verifyToken, searchUser);

// /api/users/:id
router
  .route("/:id")
  .put(verifyTokenAndAuthorization, updateUser)
  .get(verifyTokenAndAuthorization, getUserById)
  .delete(verifyTokenAndAuthorization, deleteUser);

// /api/users/follow-user/:id
router.route("/follow-user/:id").patch(verifyToken, followUser);
// /api/users/unfollow-user/:id
router.route("/unfollow-user/:id").patch(verifyToken, unFollowUser);


module.exports = router;
