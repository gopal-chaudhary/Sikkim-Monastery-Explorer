import { useState } from 'react'

function withQuery(url, params) {
  try {
    const u = new URL(url)
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      u.searchParams.set(k, String(v))
    })
    return u.toString()
  } catch {
    return url
  }
}

function optimizeRemoteImage(url, { width } = {}) {
  if (!url) return url

  // Unsplash supports fast WebP + width transforms.
  if (url.includes('images.unsplash.com')) {
    return withQuery(url, {
      auto: 'format',
      fit: 'crop',
      q: 70,
      w: width || 1200,
      fm: 'webp',
    })
  }

  // Generic: no safe transform available.
  return url
}

// Default fallback images for different contexts
const FALLBACK_IMAGES = {
  monastery: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
  landscape: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
  general: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80'
}

/**
 * SmartImage
 * - defaults to lazy + async decode
 * - optionally optimizes known CDNs (e.g. Unsplash)
 * - includes error handling with fallback images
 */
export function SmartImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  width,
  height,
  sizes,
  srcSet,
  optimizeWidth,
  style,
  fallbackType = 'general',
  onError,
  ...rest
}) {
  const [imgSrc, setImgSrc] = useState(() => optimizeRemoteImage(src, { width: optimizeWidth }))
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      // Use fallback image based on type
      const fallback = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.general
      setImgSrc(fallback)
      
      // Call custom error handler if provided
      onError?.()
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
      style={style}
      onError={handleError}
      {...rest}
    />
  )
}

