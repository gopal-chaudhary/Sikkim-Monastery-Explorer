import { useState } from 'react'

export default function SafeImage({ 
  src, 
  alt, 
  fallback = '/images/monastery-fallback.jpg',
  className = '',
  ...props 
}) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={`${className} ${hasError ? 'opacity-80' : ''}`}
      {...props}
    />
  )
}
