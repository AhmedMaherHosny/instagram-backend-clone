const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  resendOTP,
} = require("../controllers/auth_controller");

// /api/auth/register
router.post("/register", register);

// /api/auth/verify-email
router.post("/verify-email", verifyEmail);

// /api/auth/resend-otp
router.post("/resend-otp", resendOTP);

// /api/auth/login
router.post("/login", login);

module.exports = router;
