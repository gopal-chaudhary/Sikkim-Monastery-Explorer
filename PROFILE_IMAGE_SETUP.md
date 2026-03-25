# Profile Image Upload Setup Guide

## Backend Setup

### 1. Install Required Dependencies
```bash
cd monastries_backend
npm install multer uuid
```

### 2. Update User Model (if needed)
Ensure your User model has the `photoUrl` field:
```javascript
// In src/models/user.js
const userSchema = new mongoose.Schema({
  // ... other fields
  photoUrl: {
    type: String,
    default: ''
  }
});
```

### 3. Create Uploads Directory
The backend automatically creates the `src/uploads/profile/` directory, but ensure it exists:
```bash
mkdir -p src/uploads/profile
```

### 4. Environment Variables
Add to your `.env` file:
```env
NODE_ENV=development
PORT=5000
```

### 5. Start Backend Server
```bash
npm start
```

## Frontend Setup

### 1. Profile Image Upload Component
The `ProfileImageUpload.jsx` component provides:
- **Drag & Drop Support**: Users can drag images directly onto the avatar
- **File Selection**: Click to select from device
- **Image Preview**: Shows preview before saving
- **Validation**: Checks file type and size (max 5MB)
- **Remove Function**: Delete current profile picture
- **Fallback Avatar**: Shows initials when no image

### 2. Features Included
- **Smart Initials**: Generates from user's first and last name
- **Hover Effects**: Camera icon appears on hover
- **Loading States**: Spinner during upload
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all screen sizes

### 3. Usage Example
```javascript
import ProfileImageUpload from '../components/ProfileImageUpload'

<ProfileImageUpload
  currentImage={user.photoUrl}
  firstName={user.firstName}
  lastName={user.lastName}
  onImageChange={handleImageChange}
  onImageRemove={handleImageRemove}
  size="large"
/>
```

## API Endpoints

### Upload Profile Image
```
POST /api/profile/upload-image
Content-Type: multipart/form-data
Body: profileImage (file)
Response: { message: string, imageUrl: string }
```

### Remove Profile Image
```
DELETE /api/profile/remove-image
Response: { message: string }
```

### Serve Profile Images
```
GET /uploads/profile/:filename
Returns: Image file
```

## File Storage

### Current Implementation
- **Location**: `src/uploads/profile/`
- **Naming**: UUID + original extension
- **Cleanup**: Old images deleted when new ones uploaded
- **Size Limit**: 5MB per image
- **Formats**: JPG, PNG, GIF, WebP

### Production Considerations
For production, consider using cloud storage:
- **AWS S3**: Scalable object storage
- **Cloudinary**: Image optimization and CDN
- **Google Cloud Storage**: Alternative cloud option

## Security Features

### File Validation
- **Type Checking**: Only image files allowed
- **Size Limits**: 5MB maximum file size
- **Sanitized Filenames**: UUID prevents directory traversal
- **Authentication**: Protected routes require login

### Error Handling
- **Upload Failures**: Graceful fallback to UI update
- **File Errors**: User-friendly error messages
- **Network Issues**: Proper timeout and retry logic

## UI/UX Features

### Visual Design
- **Circular Avatar**: Modern, professional appearance
- **Gradient Fallback**: Beautiful initials background
- **Hover States**: Clear interactive feedback
- **Smooth Transitions**: 200ms animations

### User Experience
- **Drag & Drop**: Intuitive file upload
- **Preview Before Save**: See changes before committing
- **Loading Indicators**: Clear feedback during operations
- **Success States**: Confirmation when actions complete

## Mobile Optimization

### Responsive Design
- **Touch Targets**: 44px minimum touch areas
- **Mobile Layout**: Stacked layout on small screens
- **Performance**: Optimized for mobile networks
- **Accessibility**: Proper labels and ARIA attributes

## Troubleshooting

### Common Issues

#### Image Not Uploading
1. Check backend server is running
2. Verify multer dependencies installed
3. Check uploads directory permissions
4. Ensure user is authenticated

#### Images Not Displaying
1. Verify static file serving configured
2. Check image URLs in browser dev tools
3. Ensure CORS settings allow image access
4. Check file paths and directory structure

#### Large File Errors
1. File size limit is 5MB
2. Check multer configuration
3. Verify client-side validation
4. Consider increasing limit if needed

### Debug Tips
```javascript
// Check if image uploads work
console.log('Uploading file:', file.name, file.size);

// Verify server response
const response = await fetch('/api/profile/upload-image', {...});
console.log('Upload response:', await response.json());

// Check image URL construction
const imageUrl = `/uploads/profile/${filename}`;
console.log('Image URL:', imageUrl);
```

## Performance Optimization

### Frontend Optimizations
- **Lazy Loading**: Images load only when needed
- **Compression**: Images optimized for web
- **Caching**: Browser caching headers
- **CDN**: Consider CDN for production

### Backend Optimizations
- **File Cleanup**: Automatic old file removal
- **Compression**: Gzip for API responses
- **Rate Limiting**: Prevent upload abuse
- **Monitoring**: Track upload success rates

## Future Enhancements

### Planned Features
- **Image Cropping**: Built-in crop functionality
- **Multiple Formats**: WebP, AVIF support
- **Image Optimization**: Automatic compression
- **Bulk Operations**: Admin bulk upload tools

### Advanced Options
- **Face Detection**: Automatic face centering
- **Background Removal**: AI-powered background removal
- **Image Filters**: Instagram-style filters
- **Album Support**: Multiple profile pictures

This profile image system provides a complete, production-ready solution for user avatar management with modern UI/UX and robust backend support.
