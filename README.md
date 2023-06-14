# Instagram Backend Clone

This repository contains the backend code for an Instagram clone. It provides the necessary API endpoints and functionalities to replicate some of the core features of Instagram. The project is built using Node.js and several libraries that enhance its functionality. Here's an overview of the libraries used:

## Libraries

- **bcryptjs**: A library for hashing passwords and comparing hashed passwords. It helps secure user authentication by storing passwords in a secure manner.

- **cloudinary**: An image and video hosting service that provides cloud-based storage for media files. It allows for easy management and manipulation of media assets.

- **cors**: A middleware that enables Cross-Origin Resource Sharing (CORS) support in Express.js. It allows the backend server to handle requests from different origins.

- **dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`. It simplifies the process of managing configuration settings.

- **express**: A fast, unopinionated, and minimalist web framework for Node.js. It provides a robust set of features for web applications, including routing, middleware support, and request/response handling.

- **express-async-handler**: A utility module for handling asynchronous errors in Express.js middleware and route handlers. It simplifies error handling and improves code readability.

- **helmet**: A collection of middleware functions for securing Express.js applications. It helps protect against common web vulnerabilities by setting various HTTP headers.

- **http-status-codes**: A library that provides a convenient way to reference HTTP status codes in Node.js. It improves code readability and maintainability when working with HTTP responses.

- **joi**: A powerful schema description language and data validation library for JavaScript. It allows defining the structure and constraints of data objects and validating them.

- **joi-password-complexity**: A plugin for Joi that adds password complexity validation. It helps enforce strong password requirements, improving the security of user accounts.

- **jsonwebtoken**: A library for generating and verifying JSON Web Tokens (JWTs). It provides a secure way to authenticate and authorize users in web applications.

- **moment**: A JavaScript library for parsing, validating, manipulating, and formatting dates and times. It simplifies working with dates and times in various formats.

- **mongoose**: An object modeling tool for MongoDB and Node.js. It provides a straightforward way to interact with MongoDB databases and define data schemas.

- **multer**: A middleware for handling multipart/form-data, primarily used for uploading files in Node.js. It simplifies file uploading and processing.

- **nodemailer**: A module for sending emails from Node.js applications. It enables easy integration of email functionality, such as sending verification emails or notifications.

- **otp-generator**: A library for generating one-time passwords (OTPs). It is useful for implementing two-factor authentication (2FA) or other secure authentication mechanisms.

- **request-ip**: A middleware for extracting the client's IP address from incoming HTTP requests. It provides a simple way to access the IP address for logging or security purposes.

- **socket.io**: A library that enables real-time, bidirectional communication between web clients and servers. It facilitates building interactive features like live chat or notifications.

- **streamifier**: A library for creating readable streams from various data sources. It allows working with streams in Node.js applications, enabling efficient data processing.

- **xss-clean**: A middleware that sanitizes user input to prevent Cross-Site Scripting (XSS) attacks. It helps protect against malicious scripts injected into user-provided data.

## Development Dependencies

- **nodemon**: A development tool that monitors changes in the source code and automatically restarts the server. It enhances the development workflow by eliminating the need for manual server restarts.
