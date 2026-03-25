import React, { useState, useCallback } from 'react';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';

const MonasteryImage = ({ 
  monastery, 
  className = '', 
  alt,
  loading = 'lazy',
  optimizeWidth = 800,
  fallbackText = 'Image not available',
  showFallback = true,
  onImageError,
  ...props 
}) => {
  const [imageState, setImageState] = useState({
    isLoading: true,
    hasError: false,
    currentUrl: monastery?.imageUrl,
    retryCount: 0
  });

  // Fallback image URL generator
  const getFallbackImageUrl = useCallback((monasteryName) => {
    // Create a consistent hash for the monastery name
    let hash = 0;
    for (let i = 0; i < monasteryName.length; i++) {
      const char = monasteryName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Use predefined fallback images based on hash
    const fallbackImages = [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&q=80',
      'https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800&q=80',
      'https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    ];
    
    const index = Math.abs(hash) % fallbackImages.length;
    return fallbackImages[index];
  }, []);

  // Handle image loading
  const handleLoad = useCallback(() => {
    setImageState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false
    }));
  }, []);

  // Handle image error with retry logic
  const handleError = useCallback(async () => {
    const { retryCount, currentUrl } = imageState;
    
    // Don't retry more than 2 times
    if (retryCount >= 2) {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true
      }));
      
      if (onImageError) {
        onImageError(monastery);
      }
      return;
    }

    // Try to fetch a new image from the API
    if (monastery?._id && retryCount === 0) {
      try {
        const response = await fetch(`/api/monasteries/${monastery._id}/image?refresh=true`);
        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl && data.imageUrl !== currentUrl) {
            setImageState(prev => ({
              ...prev,
              currentUrl: data.imageUrl,
              retryCount: prev.retryCount + 1
            }));
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch new image:', error);
      }
    }

    // Use fallback image
    if (monastery?.name) {
      const fallbackUrl = getFallbackImageUrl(monastery.name);
      setImageState(prev => ({
        ...prev,
        currentUrl: fallbackUrl,
        retryCount: prev.retryCount + 1
      }));
    } else {
      // Final fallback - show error state
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        retryCount: prev.retryCount + 1
      }));
    }
  }, [imageState.retryCount, imageState.currentUrl, monastery, getFallbackImageUrl, onImageError]);

  // Reset state when monastery changes
  React.useEffect(() => {
    setImageState({
      isLoading: true,
      hasError: false,
      currentUrl: monastery?.imageUrl,
      retryCount: 0
    });
  }, [monastery?.imageUrl, monastery?._id]);

  // If no monastery data, show nothing or placeholder
  if (!monastery) {
    return showFallback ? (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
        <div className="text-center p-4">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">{fallbackText}</p>
        </div>
      </div>
    ) : null;
  }

  // Show error state
  if (imageState.hasError) {
    if (!showFallback) return null;
    
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">{fallbackText}</p>
          <p className="text-xs text-gray-400 mt-1">{monastery.name}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (imageState.isLoading && !imageState.currentUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageState.currentUrl}
        alt={alt || `${monastery.name} monastery`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState.isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Loading overlay */}
      {imageState.isLoading && imageState.currentUrl && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded animate-spin"></div>
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonasteryImage;
