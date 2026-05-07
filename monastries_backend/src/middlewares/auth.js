const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/env");
const logger = require("../utils/logger");
const { AppError } = require("./errorHandler");

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new AppError("Authentication required", 401);
        }

        const decodedObj = await jwt.verify(token, config.jwtSecret);
        const { _id } = decodedObj;
        const user = await User.findById(_id);
        
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (user.role !== 'admin') {
            logger.warn({ userId: user._id, role: user.role }, 'Unauthorized admin access attempt');
            throw new AppError("Admin access required", 403);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return next(new AppError("Invalid token", 401));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new AppError("Token expired", 401));
        }
        next(err);
    }
};

// User authentication middleware
const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            throw new AppError("Authentication required. Please log in", 401);
        }

        const decodedObj = await jwt.verify(token, config.jwtSecret);
        const { _id } = decodedObj;
        const user = await User.findById(_id);
        
        if (!user) {
            throw new AppError("User not found", 404);
        }
        
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return next(new AppError("Invalid token. Please log in again", 401));
        }
        if (err.name === 'TokenExpiredError') {
            return next(new AppError("Session expired. Please log in again", 401));
        }
        next(err);
    }
};

module.exports = {
    adminAuth,
    userAuth
};