export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg-page">
      {/* Skeleton navbar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-card/80">
        <div className="h-5 w-20 rounded bg-border-subtle animate-pulse" />
        <div className="flex gap-4">
          <div className="h-4 w-16 rounded bg-border-subtle animate-pulse" />
          <div className="h-4 w-16 rounded bg-border-subtle animate-pulse" />
        </div>
        <div className="h-9 w-[120px] rounded-lg bg-border-subtle animate-pulse" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-10 space-y-8">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-border-subtle animate-pulse" />
          <div className="h-4 w-32 rounded bg-border-subtle animate-pulse" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-64 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          <div className="h-64 rounded-xl bg-bg-card border border-border-default animate-pulse" />
        </div>

        {/* Table */}
        <div className="h-48 rounded-xl bg-bg-card border border-border-default animate-pulse" />
      </div>
    </div>
  )
}
