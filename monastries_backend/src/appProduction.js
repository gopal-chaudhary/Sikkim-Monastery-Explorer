const express = require("express");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://localhost:5173',
        'http://localhost:5174',
      ],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Performance and security middlewares
app.disable('x-powered-by');
app.set('etag', 'weak');
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return true;
  },
}));

// Increase payload limits for file uploads
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE ? `${parseInt(process.env.MAX_FILE_SIZE)}b` : '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ success: false, message: 'Invalid JSON' });
      return;
    }
  }
}));

app.use(express.urlencoded({ 
  limit: process.env.MAX_FILE_SIZE ? `${parseInt(process.env.MAX_FILE_SIZE)}b` : '10mb', 
  extended: true 
}));

app.use(require("cookie-parser")());

// Request logging middleware
app.use(logger.httpLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
  });
});

// Static files with caching
app.use('/uploads', express.static('uploads', {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  lastModified: true,
}));

// API Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const profileImageRouter = require("./routes/profileImage");
const profileNewRouter = require("./routes/profileNew");
const userRouter = require("./routes/user");
const monasteryRouter = require("./routes/monastery");
const travelGuideRouter = require("./routes/travelGuide");
const contributionRouter = require("./routes/contribution");
const locationRouter = require("./routes/location");
const guideRouter = require("./routes/guide");
const reviewRouter = require("./routes/review");
const imageRouter = require("./routes/image");
const requestRouter = require("./routes/request");

// Mount routes with proper versioning
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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.logError(err, req);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 3777;
connectDB().then(() => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Database connection established ...`);
  console.log(`🌐 Server is successfully running on port ${PORT} .....`);
  
  app.listen(PORT, () => {
    console.log(`✅ Server ready on port ${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});
