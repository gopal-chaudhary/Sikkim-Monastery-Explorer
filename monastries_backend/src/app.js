const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
require('dotenv').config();

const config = require("./config/env");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middlewares/errorHandler");
const { apiLimiter } = require("./middlewares/rateLimiter");

const allowedOriginsSet = new Set(config.allowedOrigins);

// CORS configuration for frontend
const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / curl / mobile apps (no Origin header)
    if (!origin) return cb(null, true);
    if (allowedOriginsSet.has(origin)) return cb(null, true);
    logger.warn({ origin }, 'CORS request from unauthorized origin');
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security middleware - helmet
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// HTTP request logging with pino
app.use(pinoHttp({ 
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/live'
  }
}));

// Security headers
app.disable('x-powered-by');
app.set('etag', 'weak');

// Compression
app.use(compression());

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cookie parser
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check routes
const healthRouter = require("./routes/health");
app.use("/", healthRouter);

// API Routes with versioning
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
const aiRouter = require("./routes/ai");

// Mount routes with /api/v1 prefix
app.use("/api/v1", authRouter);
app.use("/api/v1", profileRouter);
app.use("/api/v1", requestRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", monasteryRouter);
app.use("/api/v1", travelGuideRouter);
app.use("/api/v1", contributionRouter);
app.use("/api/v1", locationRouter);
app.use("/api/v1", guideRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1/ai", aiRouter);

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, starting graceful shutdown`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    require('mongoose').connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, config.shutdownTimeout);
};

let server;

connectDB()
    .then(() => {
        logger.info("Database connection established");
        server = app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((err) => {
        logger.error({ err }, "Database connection failed");
        process.exit(1);
    });