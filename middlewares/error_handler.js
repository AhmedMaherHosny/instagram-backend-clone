const {StatusCodes} = require("http-status-codes");
const multer = require("multer");

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(StatusCodes.NOT_FOUND);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode =
    res.statusCode === StatusCodes.ACCEPTED
      ? StatusCodes.INTERNAL_SERVER_ERROR
      : res.statusCode;
  res.status(statusCode).json({ message: error.message });
};

const multerError = (error, req, res, next) =>{
  if (error instanceof multer.MulterError) {
    res.status(400).json({ message: error.message });
  } else {
    next(error);
  }
}

module.exports = {
  notFound,
  errorHandler,
  multerError
};
