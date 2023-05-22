module.exports = (req, res, next) => {
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl} - ${
        res.statusCode
      } ${res.statusMessage}`
    );
  });
  next();
};
