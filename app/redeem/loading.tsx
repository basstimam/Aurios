export default function RedeemLoading() {
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
        <div className="space-y-4">
          <div className="h-6 w-36 rounded bg-border-subtle animate-pulse mx-auto" />
          <div className="h-4 w-56 rounded bg-border-subtle animate-pulse mx-auto" />
        </div>

        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          <div className="h-16 rounded-xl bg-bg-card border border-border-default animate-pulse" />
          <div className="h-12 rounded-lg bg-border-subtle animate-pulse" />
        </div>
      </div>
    </div>
  )
}
