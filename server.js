const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middlewares/error");

// Route
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/course");
const auth = require("./routes/auth");
const users = require("./routes/users")
const review = require("./routes/review")

// Database
const connectDB = require("./config/db");
const { mongo } = require("mongoose");

// Load env vars
dotenv.config({ path: "./config/.env" });

const app = express();

// parse application/json body parser
app.use(bodyParser.json());

// Cookie Parser 
app.use(cookieParser());

// Dev logginng Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File Upload
app.use(fileupload());

// Sanitize Data
app.use(mongoSanitize()); 

// Set security header
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs : 10 * 60 * 1000,
  max : 100
})

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable cors
app.use(cors());


// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/auth/users", users);
app.use("/api/v1/reviews", review);

// Using ErrorHandler
app.use(errorHandler);

// Connect to database
connectDB();

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle Unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
