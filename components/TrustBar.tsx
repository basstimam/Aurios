export function TrustBar() {
  return (
    <div className="flex items-center justify-center py-2 px-6 bg-bg-card border-b border-border-subtle">
      <p className="text-text-secondary text-xs font-inter flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Non-Custodial
        </span>
        <span className="text-border-subtle">·</span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Audited Protocol
        </span>
        <span className="text-border-subtle">·</span>
        <span className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Base Chain
        </span>
        <span className="text-border-subtle">·</span>
        <span className="text-accent-amber font-medium">$14.7M TVL Protected</span>
      </p>
    </div>
  )
}
