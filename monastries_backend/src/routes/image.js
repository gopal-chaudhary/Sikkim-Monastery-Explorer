const express = require('express');
const Monastery = require('../models/monastery');
const { getMonasteryImageUrl, updateMissingImages } = require('../services/imageService');

const router = express.Router();

/**
 * GET /api/monasteries/:id/image
 * Get or update image for a specific monastery
 */
router.get('/:id/image', async (req, res) => {
  try {
    const monastery = await Monastery.findById(req.params.id);
    
    if (!monastery) {
      return res.status(404).json({ error: 'Monastery not found' });
    }

    // If image is placeholder or missing, fetch a new one
    const isPlaceholder = monastery.imageUrl && (
      monastery.imageUrl.includes('placeholder') ||
      monastery.imageUrl.includes('unsplash.com/photo-1626621341517-bbf3d9990a23')
    );

    if (!monastery.imageUrl || isPlaceholder || !monastery.imageVerified || req.query.refresh === 'true') {
      const imageData = await getMonasteryImageUrl(monastery.name);
      if (imageData && imageData.url) {
        monastery.imageUrl = imageData.url;
        monastery.imageSource = imageData.source;
        monastery.imageVerified = imageData.verified;
        await monastery.save();
      }
    }

    res.json({
      id: monastery._id,
      name: monastery.name,
      imageUrl: monastery.imageUrl,
      imageSource: monastery.imageSource,
      imageVerified: monastery.imageVerified,
      isPlaceholder: isPlaceholder
    });
  } catch (error) {
    console.error('Error fetching monastery image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

/**
 * POST /api/monasteries/update-images
 * Update images for all monasteries (admin endpoint)
 */
router.post('/update-images', async (req, res) => {
  try {
    // Run in background
    updateMissingImages();
    
    res.json({ 
      message: 'Image update process started in background',
      status: 'processing'
    });
  } catch (error) {
    console.error('Error starting image update:', error);
    res.status(500).json({ error: 'Failed to start image update' });
  }
});

/**
 * PUT /api/monasteries/:id/image
 * Manually set image for a monastery (admin endpoint)
 */
router.put('/:id/image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const monastery = await Monastery.findByIdAndUpdate(
      req.params.id,
      { 
        imageUrl,
        imageSource: 'manual',
        imageVerified: true
      },
      { new: true }
    );

    if (!monastery) {
      return res.status(404).json({ error: 'Monastery not found' });
    }

    res.json({
      message: 'Image updated successfully',
      monastery: {
        id: monastery._id,
        name: monastery.name,
        imageUrl: monastery.imageUrl,
        imageSource: monastery.imageSource,
        imageVerified: monastery.imageVerified
      }
    });
  } catch (error) {
    console.error('Error updating monastery image:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router;
