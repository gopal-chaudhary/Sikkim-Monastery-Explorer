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

/**
 * SmartImage
 * - defaults to lazy + async decode
 * - optionally optimizes known CDNs (e.g. Unsplash)
 */
export function SmartImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchpriority,
  width,
  height,
  sizes,
  srcSet,
  optimizeWidth,
  style,
  ...rest
}) {
  const finalSrc = optimizeRemoteImage(src, { width: optimizeWidth })

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      fetchpriority={fetchpriority}
      width={width}
      height={height}
      sizes={sizes}
      srcSet={srcSet}
      style={style}
      {...rest}
    />
  )
}

