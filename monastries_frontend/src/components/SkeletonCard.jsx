export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-stone-900/60 border border-amber-900/30">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
      </div>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="aspect-[3/1] skeleton rounded-2xl" />
      <div className="h-8 w-2/3 skeleton rounded" />
      <div className="h-4 w-full skeleton rounded" />
      <div className="h-4 w-full skeleton rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 skeleton rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 border border-amber-900/30">
          <div className="flex items-start gap-4">
            <div className="w-24 h-20 rounded-xl skeleton flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 skeleton rounded" />
              <div className="h-3 w-1/3 skeleton rounded" />
              <div className="h-3 w-full skeleton rounded" />
              <div className="h-3 w-5/6 skeleton rounded" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-9 w-24 skeleton rounded-xl" />
            <div className="h-9 w-24 skeleton rounded-xl" />
            <div className="h-9 w-24 skeleton rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
