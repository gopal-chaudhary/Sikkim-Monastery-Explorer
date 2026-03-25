import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, User } from 'lucide-react'

export default function ProfileImageUpload({ 
  currentImage, 
  firstName, 
  lastName, 
  onImageChange, 
  onImageRemove,
  size = 'large' 
}) {
  const [preview, setPreview] = useState(currentImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    small: 'w-16 h-16 text-sm',
    medium: 'w-24 h-24 text-lg',
    large: 'w-32 h-32 text-xl'
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  const handleFileSelect = useCallback((file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setIsUploading(false)
      onImageChange(file)
    }
    reader.readAsDataURL(file)
  }, [onImageChange])

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemove = async () => {
    try {
      // If it's a server-stored image, call the remove API
      if (currentImage && (currentImage.includes('/uploads/profile/') || currentImage.includes('/uploads/profiles/'))) {
        const response = await fetch('/api/profile-new/remove-photo', {
          method: 'DELETE',
          credentials: 'include'
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Failed to remove image')
        }
      }
      
      setPreview(null)
      onImageRemove()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error removing image:', error)
      // Still update UI even if API call fails
      setPreview(null)
      onImageRemove()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Avatar container */}
      <div className="relative group">
        {/* Avatar */}
        <div 
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg transition-all duration-200 ${
            dragActive ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-hover)] flex items-center justify-center text-white font-bold">
              {getInitials(firstName, lastName)}
            </div>
          )}
        </div>

        {/* Upload overlay */}
        <div 
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          onClick={openFileSelector}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Remove button */}
        {preview && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload button for mobile */}
      <button
        type="button"
        onClick={openFileSelector}
        className="mt-4 w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors duration-200 text-sm text-[var(--text-primary)] flex items-center justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {preview ? 'Change photo' : 'Upload photo'}
      </button>

      {/* Help text */}
      <p className="mt-2 text-xs text-[var(--text-muted)] text-center">
        JPG, PNG or GIF (max. 5MB)
      </p>
    </div>
  )
}
