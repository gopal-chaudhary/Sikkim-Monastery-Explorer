const axios = require('axios');
const Monastery = require('../models/monastery');

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'YOUR_UNSPLASH_ACCESS_KEY';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Wikipedia API configuration
const WIKIPEDIA_BASE_URL = 'https://en.wikipedia.org/api/rest_v1';

// Fallback image URLs for monasteries
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', // Generic monastery
  'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80', // Temple
  'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80', // Buddhist temple
  'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80', // Traditional architecture
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80', // Mountain monastery
];

// Monastery-specific image mapping (manual curation for accuracy)
const MONASTERY_IMAGE_MAP = {
  'Enchey Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Rumtek Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Pemayangtse Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Tashiding Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Phodong Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'Ralong Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Dubdi Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Sang Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Karthok Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Rhenock Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'Simik Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Labrang Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Lachen Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Lachung Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Tholung Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'Phensang Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Kabi Longstok Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Sinon Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Hee Gyathang Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Bering Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'Chawang Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Chubo Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Dikchu Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Lingthem Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Mangan Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  'Namchi Monastery': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'Ravangla Monastery': 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
  'Soreng Monastery': 'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
  'Yangyang Monastery': 'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
  'Zaluk Monastery': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
};

/**
 * Fetch image from Unsplash API
 */
async function fetchFromUnsplash(monasteryName) {
  try {
    const searchQuery = `${monasteryName} Sikkim monastery`;
    const response = await axios.get(`${UNSPLASH_BASE_URL}/search/photos`, {
      params: {
        query: searchQuery,
        per_page: 1,
        orientation: 'landscape',
        content_filter: 'high',
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
  } catch (error) {
    console.warn(`Unsplash API failed for ${monasteryName}:`, error.message);
  }
  return null;
}

/**
 * Fetch image from Wikipedia API
 */
async function fetchFromWikipedia(monasteryName) {
  try {
    // First, search for the page
    const searchResponse = await axios.get(`${WIKIPEDIA_BASE_URL}/page/summary/${encodeURIComponent(monasteryName)}`);
    
    if (searchResponse.data.type === 'standard' && searchResponse.data.thumbnail) {
      // Get the original image URL (remove size constraints)
      const thumbnailUrl = searchResponse.data.thumbnail.source;
      const originalUrl = thumbnailUrl.replace(/\/\d+px-/, '/').replace(/\/thumb\//, '/wiki/File:');
      return originalUrl;
    }
  } catch (error) {
    console.warn(`Wikipedia API failed for ${monasteryName}:`, error.message);
  }
  return null;
}

/**
 * Get fallback image based on monastery name hash
 */
function getFallbackImage(monasteryName) {
  // Create a consistent hash from the monastery name
  let hash = 0;
  for (let i = 0; i < monasteryName.length; i++) {
    const char = monasteryName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to select a consistent fallback image
  const index = Math.abs(hash) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
}

/**
 * Get the best available image for a monastery
 */
async function getMonasteryImage(monasteryName, source = null) {
  // 1. Check manual mapping first (most accurate)
  if (MONASTERY_IMAGE_MAP[monasteryName]) {
    return {
      url: MONASTERY_IMAGE_MAP[monasteryName],
      source: 'manual',
      verified: true
    };
  }

  // 2. Try Wikipedia API (most reliable for specific monasteries)
  if (!source || source === 'wikipedia') {
    const wikipediaImage = await fetchFromWikipedia(monasteryName);
    if (wikipediaImage) {
      return {
        url: wikipediaImage,
        source: 'wikipedia',
        verified: true
      };
    }
  }

  // 3. Try Unsplash API (good quality, generic)
  if ((!source || source === 'unsplash') && UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY') {
    const unsplashImage = await fetchFromUnsplash(monasteryName);
    if (unsplashImage) {
      return {
        url: unsplashImage,
        source: 'unsplash',
        verified: false
      };
    }
  }

  // 4. Use consistent fallback
  return {
    url: getFallbackImage(monasteryName),
    source: 'fallback',
    verified: false
  };
}

/**
 * Update missing images for all monasteries
 */
async function updateMissingImages() {
  try {
    const monasteries = await Monastery.find({});
    
    for (const monastery of monasteries) {
      // Check if current image is a placeholder or missing
      const isPlaceholder = monastery.imageUrl && (
        monastery.imageUrl.includes('placeholder') ||
        monastery.imageUrl.includes('unsplash.com/photo-1626621341517-bbf3d9990a23')
      );
      
      if (!monastery.imageUrl || isPlaceholder || !monastery.imageVerified) {
        console.log(`Updating image for: ${monastery.name}`);
        const imageData = await getMonasteryImage(monastery.name);
        
        if (imageData && imageData.url) {
          monastery.imageUrl = imageData.url;
          monastery.imageSource = imageData.source;
          monastery.imageVerified = imageData.verified;
          await monastery.save();
          console.log(`✓ Updated image for ${monastery.name} (${imageData.source})`);
        }
      }
    }
    
    console.log('Image update process completed');
  } catch (error) {
    console.error('Error updating images:', error);
  }
}

/**
 * Get image for a specific monastery (used by API endpoints)
 */
async function getMonasteryImageUrl(monasteryName, source = null) {
  return await getMonasteryImage(monasteryName, source);
}

module.exports = {
  getMonasteryImage,
  updateMissingImages,
  getMonasteryImageUrl,
  MONASTERY_IMAGE_MAP,
  FALLBACK_IMAGES,
};
