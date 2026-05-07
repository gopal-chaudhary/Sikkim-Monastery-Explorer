const logger = require('../utils/logger');
const { ZodError } = require('zod');

// Custom error class for application errors
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error
    logger.error({
        err: {
            message: error.message,
            stack: err.stack,
            statusCode: error.statusCode
        },
        req: {
            method: req.method,
            url: req.url,
            ip: req.ip
        }
    }, 'Error occurred');

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        const message = `Invalid input data: ${errors.join(', ')}`;
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again';
        error = new AppError(message, 401);
    }

    // Zod validation errors
    if (err instanceof ZodError) {
        const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        const message = `Validation failed: ${errors.join(', ')}`;
        error = new AppError(message, 400);
    }

    // Send error response
    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
            error: err,
            stack: err.stack
        })
    };

    res.status(statusCode).json(response);
};

// Async error wrapper to catch errors in async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

module.exports = {
    errorHandler,
    asyncHandler,
    notFound,
    AppError
};
