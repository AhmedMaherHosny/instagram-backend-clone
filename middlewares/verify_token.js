const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

function verifyToken(req, res, next) {
  const token = req.headers.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    }
  } else {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "You must login first!" });
  }
}

function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed!",
      });
    }
  });
}

function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not allowed, only admins allowed!",
      });
    }
  });
}

module.exports = {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyToken,
};
