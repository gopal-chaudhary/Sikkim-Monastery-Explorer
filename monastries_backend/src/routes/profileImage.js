const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/profile');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
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
 * POST /api/profile/upload-image
 * Upload profile image
 */
router.post('/upload-image', userAuth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Delete old profile image if exists
    if (req.user.photoUrl && req.user.photoUrl.includes('/uploads/profile/')) {
      const oldImagePath = path.join(__dirname, '../../', req.user.photoUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user's photoUrl in database
    const imageUrl = `/uploads/profile/${req.file.filename}`;
    await User.findByIdAndUpdate(
      req.user._id,
      { photoUrl: imageUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Clean up uploaded file if error occurred
    if (req.file) {
      const filePath = path.join(uploadsDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/profile/remove-image
 * Remove profile image
 */
router.delete('/remove-image', userAuth, async (req, res) => {
  try {
    // Delete current profile image if exists
    if (req.user.photoUrl && req.user.photoUrl.includes('/uploads/profile/')) {
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
      message: 'Profile image removed successfully'
    });

  } catch (error) {
    console.error('Error removing profile image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove image',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/profile/image/:filename
 * Serve profile images
 */
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

module.exports = router;
