import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'

export default function ProfileAvatar({ 
  src, 
  name, 
  size = 'large',
  onUpload,
  onRemove,
  uploading = false,
  showUploadButton = true 
}) {
  const [preview, setPreview] = useState(src)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    small: 'w-16 h-16 text-sm',
    medium: 'w-24 h-24 text-lg',
    large: 'w-32 h-32 text-xl',
    xlarge: 'w-40 h-40 text-2xl'
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const names = name.split(' ').filter(n => n.length > 0)
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
  }

  const handleFileSelect = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onUpload?.(file)
    }
    reader.readAsDataURL(file)
  }

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

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      <div 
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl transition-all duration-200 ${
          dragActive ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : ''
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
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {getInitials(name)}
          </div>
        )}
      </div>

      {/* Upload overlay */}
      {showUploadButton && (
        <div 
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer group"
          onClick={openFileSelector}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-200" />
          )}
        </div>
      )}

      {/* Remove button */}
      {preview && onRemove && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
            setPreview(null)
          }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-200 hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
