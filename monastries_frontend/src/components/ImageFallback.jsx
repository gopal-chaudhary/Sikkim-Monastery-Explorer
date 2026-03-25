import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ImageFallback = ({ 
  monasteryName, 
  className = '', 
  size = 'medium',
  showRetry = false,
  onRetry,
  customText 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16 text-xs',
    medium: 'w-32 h-32 text-sm',
    large: 'w-48 h-48 text-base',
    full: 'w-full h-full text-sm'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
    full: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${sizeClasses[size]} ${className}`}>
      <div className="text-center p-4">
        <AlertCircle className={`${iconSizes[size]} mx-auto mb-2 text-gray-400 dark:text-gray-500`} />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {customText || 'Image not available'}
        </p>
        {monasteryName && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px] truncate">
            {monasteryName}
          </p>
        )}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageFallback;
