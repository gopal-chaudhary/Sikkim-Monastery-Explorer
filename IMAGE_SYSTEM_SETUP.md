# Image Handling System Setup Guide

## Backend Setup

### 1. Environment Variables
Add to your `.env` file in the backend:
```env
# Unsplash API (optional but recommended)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# MongoDB connection (ensure this exists)
MONGODB_URI=mongodb://localhost:27017/sikkim-monasteries
PORT=5000
```

### 2. Get Unsplash API Key (Optional)
1. Go to https://unsplash.com/developers
2. Create a new application
3. Copy the Access Key to your `.env` file
4. This provides high-quality monastery images

### 3. Database Migration
The monastery schema has been updated with new fields:
- `imageVerified`: Boolean - tracks if image is verified
- `imageSource`: Enum - tracks where image came from
- `imageUrl`: Now optional (was required)

Run this script to update existing monasteries:
```javascript
// In your MongoDB shell or run via Node.js
db.monasteries.updateMany(
  { imageSource: { $exists: false } },
  { 
    $set: { 
      imageSource: 'placeholder',
      imageVerified: false 
    } 
  }
)
```

### 4. Start Image Update Process
```bash
# Start your backend server
cd monastries_backend
npm start

# Trigger image update for all monasteries (API call)
curl -X POST http://localhost:5000/api/monasteries/update-images
```

## Frontend Setup

### 1. Install New Components
The following components have been created:
- `MonasteryImage.jsx` - Smart image component with fallback
- `ImageFallback.jsx` - Clean fallback UI
- `FeaturedMonasteryCard.jsx` - Updated card component

### 2. Update Imports
In your components, replace:
```javascript
import { SmartImage } from './SmartImage';
```

With:
```javascript
import MonasteryImage from './MonasteryImage';
```

### 3. Update Image Usage
Replace SmartImage usage:
```javascript
// OLD
<SmartImage
  src={m.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600'}
  alt={m.name}
  className="w-full h-full object-cover"
  optimizeWidth={800}
/>

// NEW
<MonasteryImage
  monastery={m}
  className="w-full h-full object-cover"
  optimizeWidth={800}
  onImageError={(monastery) => {
    console.warn(`Failed to load image for ${monastery.name}`);
  }}
/>
```

## API Endpoints

### Get/Update Monastery Image
```
GET /api/monasteries/:id/image?refresh=true
```
- Returns image data with source and verification status
- `refresh=true` forces fetching new image

### Update All Images (Admin)
```
POST /api/monasteries/update-images
```
- Runs background process to update all monastery images

### Manual Image Set (Admin)
```
PUT /api/monasteries/:id/image
Body: { "imageUrl": "https://example.com/image.jpg" }
```
- Manually set and verify an image

## Features

### 1. Smart Image Sources (in order of preference)
1. **Manual Mapping** - Pre-curated accurate images
2. **Wikipedia API** - Real monastery images
3. **Unsplash API** - High-quality stock photos
4. **Fallback** - Consistent placeholder images

### 2. Error Handling
- Automatic retry with different sources
- Consistent fallback images based on monastery name
- Loading states and error UI
- No broken images shown

### 3. Performance
- Lazy loading by default
- Image optimization for Unsplash
- Caching in database
- Efficient retry logic

### 4. Admin Features
- Track image source and verification
- Manual override capability
- Bulk update functionality
- Image quality monitoring

## Testing

### Test Image Fallback
1. Temporarily break an image URL in the database
2. Visit the monastery page
3. Should show fallback image with retry option

### Test Image Refresh
1. Visit `/api/monasteries/:id/image?refresh=true`
2. Should fetch new image if available

### Test Manual Upload
1. Use admin panel to upload new image
2. Verify image appears and is marked as verified

## Production Considerations

### 1. Caching
- Images are cached in MongoDB
- Browser caching via proper headers
- CDN recommended for production

### 2. Performance
- Monitor API usage (Unsplash limits)
- Consider image resizing service
- Implement proper lazy loading

### 3. Monitoring
- Track failed image loads
- Monitor API rate limits
- Log image source distribution

This system ensures every monastery displays the best available image, with proper fallbacks and no broken images.
