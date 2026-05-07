/**
 * Centralized environment configuration
 * All environment variables are accessed through this module
 */

// Load environment variables first
require('dotenv').config();

const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3777,
    
    // Database
    databaseUri: process.env.DATABASE_CONNECTION_URI || 'mongodb://localhost:27017/monasteries',
    
    // Security
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    
    // Cookie
    cookie: {
        secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
        maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    
    // API Keys
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    
    // CORS
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000', 'http://localhost:5173'],
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    
    authRateLimit: {
        windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxAttempts: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 5
    },
    
    createRateLimit: {
        windowMs: parseInt(process.env.CREATE_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
        maxRequests: parseInt(process.env.CREATE_RATE_LIMIT_MAX_REQUESTS) || 10
    },
    
    // Pagination
    pagination: {
        defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
        maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100
    },
    
    // Contribution System
    contribution: {
        defaultPoints: parseInt(process.env.CONTRIBUTION_DEFAULT_POINTS) || 100,
        explorerThreshold: parseInt(process.env.CONTRIBUTION_EXPLORER_THRESHOLD) || 100,
        pathfinderThreshold: parseInt(process.env.CONTRIBUTION_PATHFINDER_THRESHOLD) || 500,
        guardianThreshold: parseInt(process.env.CONTRIBUTION_GUARDIAN_THRESHOLD) || 1000
    },
    
    // Review System
    review: {
        minLength: parseInt(process.env.REVIEW_MIN_LENGTH) || 5,
        maxLength: parseInt(process.env.REVIEW_MAX_LENGTH) || 1000
    },
    
    // Travel Guide
    travelGuide: {
        searchRadius: parseInt(process.env.TRAVEL_GUIDE_SEARCH_RADIUS) || 10000, // 10km
        cacheDuration: parseInt(process.env.TRAVEL_GUIDE_CACHE_DURATION) || 7 * 24 * 60 * 60 * 1000, // 7 days
        averageSpeed: parseInt(process.env.TRAVEL_GUIDE_AVERAGE_SPEED) || 40 // km/h
    },
    
    // Bio/Profile
    bio: {
        minLength: parseInt(process.env.BIO_MIN_LENGTH) || 50,
        maxLength: parseInt(process.env.BIO_MAX_LENGTH) || 1000
    },
    
    // Graceful Shutdown
    shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 30000 // 30 seconds
};

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];

if (config.nodeEnv === 'production') {
    requiredEnvVars.push('DATABASE_CONNECTION_URI', 'GOOGLE_MAPS_API_KEY');
}

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    if (config.nodeEnv === 'production') {
        process.exit(1);
    } else {
        console.warn('Running in development mode with default values');
    }
}

module.exports = config;
