const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const config = require('../config/env');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.originalUrl
        }, 'Rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later'
        });
    }
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: config.authRateLimit.windowMs,
    max: config.authRateLimit.maxAttempts,
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.originalUrl
        }, 'Auth rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again after 15 minutes'
        });
    }
});

// Rate limiter for creating resources
const createLimiter = rateLimit({
    windowMs: config.createRateLimit.windowMs,
    max: config.createRateLimit.maxRequests,
    message: {
        success: false,
        message: 'Too many resources created, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    createLimiter
};
