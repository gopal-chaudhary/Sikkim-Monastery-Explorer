const express = require("express");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
require('dotenv').config();

// Request logging middleware
app.use(logger.httpLogger);

// CORS configuration for frontend
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
]);

const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / curl / mobile apps (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly respond to preflight requests for all routes
app.options(/.*/, cors(corsOptions));

app.disable('x-powered-by');
app.set('etag', 'weak');
app.use(compression());

// Increase payload limits for base64 image uploads from frontend forms
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const monasteryRouter = require("./routes/monastery");
const travelGuideRouter = require("./routes/travelGuide");
const contributionRouter = require("./routes/contribution");
const locationRouter = require("./routes/location");
const guideRouter = require("./routes/guide");
const reviewRouter = require("./routes/review");
const imageRouter = require("./routes/image");
const profileImageRouter = require("./routes/profileImage");
const profileNewRouter = require("./routes/profileNew");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use("/",monasteryRouter);
app.use("/",travelGuideRouter);
app.use("/",contributionRouter);
app.use("/",locationRouter);
app.use("/",guideRouter);
app.use("/",reviewRouter);
app.use("/",imageRouter);
app.use("/api/profile", profileImageRouter);
app.use("/api/profile-new", profileNewRouter);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.logError(err, req);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorResponse = {
    success: false,
    message: isDevelopment ? err.message : 'Internal server error'
  };

  // Add stack trace in development
  if (isDevelopment) {
    errorResponse.stack = err.stack;
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large'
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files'
    });
  }

  // Default error response
  const status = err.status || 500;
  res.status(status).json(errorResponse);
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

connectDB()
    .then(()=>{
        console.log("Database connection established ...");
    app.listen(process.env.PORT,()=>{
    console.log(`Server is successfully running on port ${process.env.PORT} .....`);
    });
    })
    .catch((err) =>{
        console.error("Database cannot connected!!!!");
    })