const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * GET /api/profile-new
 * Get complete user profile
 */
router.get('/', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
        about: user.about,
        location: user.location,
        skills: user.skills || [],
        photoUrl: user.photoUrl,
        role: user.role,
        contributionPoints: user.contributionPoints || 0,
        contributionsCount: user.contributionsCount || 0,
        badges: user.badges || [],
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PATCH /api/profile-new
 * Update user profile
 */
router.patch('/', userAuth, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'age', 'gender', 'about', 'location', 'skills'];
    const updates = {};
    
    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    // Handle age conversion
    if (updates.age !== undefined) {
      updates.age = updates.age === '' ? null : Number(updates.age);
    }
    
    // Handle skills array
    if (updates.skills !== undefined && !Array.isArray(updates.skills)) {
      updates.skills = updates.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
        gender: user.gender,
        about: user.about,
        location: user.location,
        skills: user.skills || [],
        photoUrl: user.photoUrl,
        role: user.role,
        contributionPoints: user.contributionPoints || 0,
        contributionsCount: user.contributionsCount || 0,
        badges: user.badges || [],
        createdAt: user.createdAt,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/profile-new/upload-photo
 * Upload profile photo
 */
router.post('/upload-photo', userAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    // Delete old profile photo if exists
    if (req.user.photoUrl && req.user.photoUrl.includes('/uploads/profiles/')) {
      const oldImagePath = path.join(__dirname, '../../', req.user.photoUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user's photoUrl in database
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    await User.findByIdAndUpdate(
      req.user._id,
      { photoUrl: photoUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        photoUrl: photoUrl,
        filename: req.file.filename
      }
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/profile-new/remove-photo
 * Remove profile photo
 */
router.delete('/remove-photo', userAuth, async (req, res) => {
  try {
    // Delete current profile photo if exists
    if (req.user.photoUrl && req.user.photoUrl.includes('/uploads/profiles/')) {
      const imagePath = path.join(__dirname, '../../', req.user.photoUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove photoUrl from database
    await User.findByIdAndUpdate(
      req.user._id,
      { photoUrl: '' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile photo removed successfully'
    });

  } catch (error) {
    console.error('Error removing photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove photo',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/profile-new/stats
 * Get user statistics
 */
router.get('/stats', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('contributionPoints contributionsCount badges role createdAt');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        contributionPoints: user.contributionPoints || 0,
        contributionsCount: user.contributionsCount || 0,
        badges: user.badges || [],
        role: user.role,
        memberSince: user.createdAt,
        rank: user.contributionPoints > 100 ? 'Gold' : user.contributionPoints > 50 ? 'Silver' : 'Bronze'
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
