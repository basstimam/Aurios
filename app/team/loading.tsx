export default function TeamLoading() {
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

      <div className="max-w-[1280px] mx-auto px-10 py-10 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded bg-border-subtle animate-pulse" />
            <div className="h-4 w-24 rounded bg-border-subtle animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-lg bg-border-subtle animate-pulse" />
        </div>

        <div className="flex gap-8">
          <div className="flex-1 h-80 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          <div className="w-[360px] space-y-6">
            <div className="h-48 rounded-xl bg-bg-card border border-border-default animate-pulse" />
            <div className="h-32 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
