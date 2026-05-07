const express = require('express');
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const config = require("../config/env");
const { signupSchema, loginSchema, validate } = require("../utils/zodSchemas");
const { asyncHandler } = require("../middlewares/errorHandler");
const { authLimiter } = require("../middlewares/rateLimiter");
const logger = require("../utils/logger");

// Signup API with rate limiting and validation
authRouter.post("/signup", authLimiter, validate(signupSchema), asyncHandler(async (req, res) => {
    const { firstName, lastName, emailId, password, age, gender } = req.body;
    
    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

    // Create new user instance
    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
        ...(age && { age }),
        ...(gender && { gender })
    });

    const savedUser = await user.save();
    
    logger.info({ userId: savedUser._id, email: savedUser.emailId }, 'New user registered');
    
    // Create JWT token and send user data
    const token = await savedUser.getJWT();
    
    const cookieOptions = {
        httpOnly: true,
        sameSite: config.cookie.sameSite,
        secure: config.cookie.secure,
        maxAge: config.cookie.maxAge
    };
    
    res.cookie("token", token, cookieOptions);
    
    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: {
            _id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            emailId: savedUser.emailId,
            age: savedUser.age,
            gender: savedUser.gender,
            photoUrl: savedUser.photoUrl,
            about: savedUser.about,
            skills: savedUser.skills,
            role: savedUser.role
        }
    });
}));

// Login API with rate limiting and validation
authRouter.post("/login", authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
    const { emailId, password } = req.body;
    
    const user = await User.findOne({ emailId });
    if (!user) {
        logger.warn({ emailId }, 'Login attempt with non-existent email');
        return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
        });
    }
    
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
        logger.warn({ userId: user._id, emailId }, 'Login attempt with invalid password');
        return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
        });
    }
    
    logger.info({ userId: user._id, emailId }, 'User logged in successfully');
    
    const token = await user.getJWT();
    
    const cookieOptions = {
        httpOnly: true,
        sameSite: config.cookie.sameSite,
        secure: config.cookie.secure,
        maxAge: config.cookie.maxAge
    };
    
    res.cookie("token", token, cookieOptions);
    
    res.json({
        success: true,
        message: "Login successful",
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            age: user.age,
            gender: user.gender,
            photoUrl: user.photoUrl,
            about: user.about,
            skills: user.skills,
            role: user.role
        }
    });
}));

// Logout API
authRouter.post("/logout", asyncHandler(async (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(0)
    });
    
    res.json({ 
        success: true, 
        message: "User logged out successfully" 
    });
}));

module.exports = authRouter;