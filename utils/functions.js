const cloudinary = require("../services/cloudinaryConfig");
const streamifier = require("streamifier");

module.exports.streamUpload = (fileBuffer, targetSize, path) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream({
      folder: path,
      transformation: [
        { width: targetSize, height: targetSize, crop: "scale" }
      ]
    }, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

