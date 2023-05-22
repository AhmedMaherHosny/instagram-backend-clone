const asyncHandler = require("express-async-handler");
const bcryptjs = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const {
  User,
  validateCreateOrUpdateUser,
  validateLoginUser,
} = require("../models/User");

/**
 *   @desc Register new user
 *   @route /api/auth/register
 *   @method Post
 *   @access public
 **/
module.exports.register = asyncHandler(async (req, res) => {
  const { error } = validateCreateOrUpdateUser(req.body, true);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  let userByEmail = await User.findOne({ email: req.body.email });
  let userByUsername = await User.findOne({ username: req.body.username });
  if (userByEmail) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "This e-mail already exist!" });
  }
  if (userByUsername) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "This username already exist!" });
  }
  const salt = await bcryptjs.genSalt(10);
  req.body.password = await bcryptjs.hash(req.body.password, salt);
  const OTP = genOTP();
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    lastIP: req.clientIp,
    otp: OTP,
  });
  await user.save();
  sendEmail(req.body.email, OTP, res);
});

/**
 *   @desc verify email via otp
 *   @route /api/auth/verify-email
 *   @method Post
 *   @access public
 **/
module.exports.verifyEmail = asyncHandler(async (req, res) => {
  if (req.body.isEmailVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Your e-mail is Already verified!" });
  }
  await validateOTP(req.body.email, req.body.otp, res);
});

/**
 *   @desc Resend otp
 *   @route /api/auth/resend-otp
 *   @method Post
 *   @access public
 **/
module.exports.resendOTP = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found" });
  }
  if (user.isEmailVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You are already verified your e-mail" });
  }
  const OTP = genOTP();
  await User.findByIdAndUpdate(user._id, {
    $set: { otp: OTP, otpExpiresAt: Date.now() + 5 * 60 * 1000 },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "OTP has been sent to your e-mail" });
});

/**
 *   @desc Login user
 *   @route /api/auth/login
 *   @method Post
 *   @access public
 **/
module.exports.login = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: error.details[0].message });
  }
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid e-mail or password" });
  }
  const isPasswordMatches = await bcryptjs.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatches) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid e-mail or password" });
  }
  if (!user.isEmailVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You must verify your e-mail!" });
  }

  const token = user.generateToken();
  const sendUser = await User.findOne({ email: req.body.email }).select(
    "-firstName -lastName -password -followers -isOnline -lastIP -phoneNumber -createdAt -updatedAt -otpExpiresAt -__v"
    );
  res.status(StatusCodes.OK).json({
    user: {
      ...sendUser.toObject(),
      token: token,
    },
  });
});

// * Function written here
const validateOTP = async (email, otp, res) => {
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "User not found" });
  }
  if (user.isEmailVerified) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You are already verified your e-mail" });
  }
  if (user.otp !== otp) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid OTP!" });
  }
  if (user.otpExpiresAt <= Date.now()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Your otp has been expired!" });
  }
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { isOnline: true, isEmailVerified: true },
      $unset: { otp: "", otpExpiresAt: "" },
    },
    { new: true }
  ).select(
    "-firstName -lastName -password -isEmailVerified -lastIP -phoneNumber -isAdmin -createdAt -updatedAt -otpExpiresAt -__v"
  );
  const token = user.generateToken();
  return res.status(StatusCodes.ACCEPTED).json({ updatedUser, token });
};

const sendEmail = (email, OTP, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });
  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Instagram verification OTP",
    text: `Your OTP code for instagram is ( ${OTP} ) this otp lasts for 5 minutes only and will expire.`,
  };
  transporter.sendMail(mailOptions, function (error, success) {
    if (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "something went wrong" });
    } else {
      res.status(StatusCodes.CREATED).json({ email });
    }
  });
};

const genOTP = () => {
  return otpGenerator.generate(9, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
};
