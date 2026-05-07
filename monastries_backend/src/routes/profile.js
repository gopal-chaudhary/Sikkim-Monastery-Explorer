const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { editProfileSchema, validate } = require("../utils/zodSchemas");
const { asyncHandler } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

// Profile API - for frontend compatibility
profileRouter.get("/profile", userAuth, asyncHandler(async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
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
            role: user.role,
            contributionPoints: user.contributionPoints,
            contributionsCount: user.contributionsCount,
            badges: user.badges || []
        }
    });
}));

// Profile API - detailed view
profileRouter.get("/profile/view", userAuth, asyncHandler(async (req, res) => {
    const user = req.user;
    res.json({
        success: true,
        user
    });
}));

// Update profile
profileRouter.patch("/profile/edit", userAuth, validate(editProfileSchema), asyncHandler(async (req, res) => {
    const loggedInUser = req.user;
    
    logger.info({ userId: loggedInUser._id }, 'User updating profile');
    
    // Update only the fields that were provided
    Object.keys(req.body).forEach((key) => {
        loggedInUser[key] = req.body[key];
    });
    
    await loggedInUser.save();
    
    logger.info({ userId: loggedInUser._id }, 'Profile updated successfully');
    
    res.json({ 
        success: true,
        message: `${loggedInUser.firstName}, your profile was updated successfully`, 
        user: loggedInUser 
    });
}));

module.exports = profileRouter;