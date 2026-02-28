'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-[#07080B] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full bg-[#0D0E15] border border-[#252838] rounded-xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1A0A0A] border border-[#EF4444] flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="font-space-grotesk text-[#F4EFE8] text-xl font-bold mb-2">
          Something went wrong
        </h1>
        <p className="text-[#9B9081] text-sm font-inter mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="bg-[#F59E0B] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D97706] transition-colors font-inter"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
