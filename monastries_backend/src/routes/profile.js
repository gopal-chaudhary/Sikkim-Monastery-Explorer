const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {validateEditProfileData, validateEditProfile} = require("../utils/validation"); 
const User = require("../models/user");

// Profile API - for frontend compatibility
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
        success: true,
        data: {
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
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//Profile API - legacy endpoint
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            return res.status(400).json({ success: false, message: "Invalid Edit request" });
        }

        // Validate the actual data
        const { validateEditProfile } = require("../utils/validation");
        validateEditProfile(req.body);

        const loggedInUser = req.user;
        
        // Update only allowed fields
        const allowedFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "age", "about", "skills"];
        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                loggedInUser[key] = req.body[key];
            }
        });
        
        await loggedInUser.save();
        
        res.json({ 
            success: true,
            message: "Profile updated successfully", 
            data: {
                _id: loggedInUser._id,
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                emailId: loggedInUser.emailId,
                age: loggedInUser.age,
                gender: loggedInUser.gender,
                photoUrl: loggedInUser.photoUrl,
                about: loggedInUser.about,
                skills: loggedInUser.skills,
                role: loggedInUser.role,
                contributionPoints: loggedInUser.contributionPoints,
                contributionsCount: loggedInUser.contributionsCount,
                badges: loggedInUser.badges || []
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
})

module.exports = profileRouter;