const multer = require("multer");
const path = require("path");

module.exports.multerConfig = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 50 * 1024 * 1024 }, // limit file size to 50MB
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".png" &&
      ext !== ".svg" &&
      ext !== ".webp" &&
      ext !== ".mp4" &&
      ext !== ".mov" &&
      ext !== ".avi" &&
      ext !== ".mkv"
    ) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

module.exports.multerConfigProfile = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 50 * 1024 * 1024 }, // limit file size to 50MB
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".png" 
    ) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});
