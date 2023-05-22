const express = require("express");
const app = express();
const connectToDb = require("./config/db_connection");
require("dotenv").config();
const helemt = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const {
  errorHandler,
  notFound,
  multerError,
} = require("./middlewares/error_handler");

// Connect to database
connectToDb();

// Apply middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", true);
app.use(require("request-ip").mw());
app.use(require("./middlewares/logging"));

// Helmet
app.use(helemt());

// xss attack
app.use(xss());

// Cors
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/profile", require("./routes/profile"));

//Error not found 404
app.use(notFound);

//Error handler
app.use(errorHandler);

// multer error
app.use(multerError);

// process.env.IP_ADDR || "localhost",
// Start server
app.listen(process.env.PORT, process.env.IP_ADDR || "localhost", () => {
  console.log(`> server is running in ${process.env.NODE_ENV}`);
});
