export default function DepositLoading() {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-card/80">
        <div className="h-5 w-20 rounded bg-border-subtle animate-pulse" />
        <div className="flex gap-4">
          <div className="h-4 w-16 rounded bg-border-subtle animate-pulse" />
          <div className="h-4 w-16 rounded bg-border-subtle animate-pulse" />
        </div>
        <div className="h-9 w-[120px] rounded-lg bg-border-subtle animate-pulse" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Step indicator skeleton */}
        <div className="flex items-center justify-center gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border-subtle animate-pulse" />
              {i < 3 && <div className="w-8 h-0.5 bg-border-subtle" />}
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-48 rounded bg-border-subtle animate-pulse mx-auto" />
          <div className="h-4 w-64 rounded bg-border-subtle animate-pulse mx-auto" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
