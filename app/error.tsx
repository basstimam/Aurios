'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full bg-bg-card border border-border-default rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="font-space-grotesk text-text-primary text-xl font-bold mb-2">
          Something went wrong
        </h1>
        <p className="text-text-secondary text-sm font-inter mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="rounded-lg px-6 py-2.5 font-inter text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
