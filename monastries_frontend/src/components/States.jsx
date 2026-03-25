import { AlertTriangle, WifiOff, RefreshCcw, SearchX } from 'lucide-react'

export function OfflineBanner({ onRetry }) {
  return (
    <div className="sticky top-14 sm:top-16 z-40 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <WifiOff className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>You&apos;re offline. Some features may not work.</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[var(--accent-border)] text-[var(--accent-primary)] hover:bg-[var(--accent-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/40"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  onRetry,
}) {
  return (
    <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--border-primary)]">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-[var(--rose-bg)] border border-[var(--rose-border)] flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[var(--rose-primary)]" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">{title}</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-primary)] hover:bg-[var(--accent-border)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]/40"
            >
              <RefreshCcw className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({
  title = 'Nothing here yet',
  message = 'Try adjusting your filters or search.',
  action,
  icon = SearchX,
}) {
  const Icon = icon
  return (
    <div className="glass rounded-2xl p-8 text-center border border-[var(--border-primary)]">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
      </div>
      <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mt-4">{title}</h2>
      <p className="text-[var(--text-secondary)] text-sm mt-1">{message}</p>
      {action}
    </div>
  )
}

