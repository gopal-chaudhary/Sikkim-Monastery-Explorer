import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {showText && (
        <span className={`${textSizes[size]} text-[var(--text-secondary)]`}>
          {text}
        </span>
      )}
    </div>
  )
}

// Full page loading component
export function FullPageLoading({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-primary)] p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[var(--bg-secondary)] rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--bg-secondary)] rounded"></div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-5/6"></div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-4/6"></div>
      </div>
    </div>
  )
}

// List of loading skeletons
export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
