import { AlertTriangle, WifiOff, RefreshCcw, SearchX } from 'lucide-react'

export function OfflineBanner({ onRetry }) {
  return (
    <div className="sticky top-14 sm:top-16 z-40 border-b border-amber-900/30 bg-stone-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-amber-100/90">
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>You’re offline. Some features may not work.</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-amber-700/40 text-amber-100 hover:bg-amber-900/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
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
    <div className="glass rounded-2xl p-6 sm:p-8 border border-amber-900/30">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-300" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-xl font-bold text-amber-50">{title}</h2>
          <p className="text-stone-300 text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
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
    <div className="glass rounded-2xl p-8 text-center border border-amber-900/30">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-amber-300" />
      </div>
      <h2 className="font-heading text-xl font-bold text-amber-50 mt-4">{title}</h2>
      <p className="text-stone-400 text-sm mt-1">{message}</p>
      {action}
    </div>
  )
}

