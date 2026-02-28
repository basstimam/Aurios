// Skeleton loading components for Smelt
// Uses Tailwind animate-pulse with dark theme colors

interface SkeletonProps {
  className?: string
}

// SkeletonText — animated pulse line for text placeholders
export function SkeletonText({ className = '' }: SkeletonProps) {
  return (
    <div className={`h-4 bg-[#1F2937] rounded animate-pulse ${className}`} />
  )
}

// SkeletonCard — animated pulse placeholder matching VaultCard dimensions
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-[#0D0E15] border border-[#1C1D27] rounded-xl p-5 animate-pulse ${className}`}>
      {/* Icon circle */}
      <div className="w-10 h-10 rounded-full bg-[#1F2937] mb-3" />
      {/* Title */}
      <div className="h-4 bg-[#1F2937] rounded w-24 mb-2" />
      {/* Description */}
      <div className="h-3 bg-[#1F2937] rounded w-32 mb-4" />
      {/* Stats row */}
      <div className="flex gap-4">
        <div className="h-3 bg-[#1F2937] rounded w-16" />
        <div className="h-3 bg-[#1F2937] rounded w-16" />
      </div>
    </div>
  )
}

// SkeletonTable — animated pulse rows matching table dimensions
export function SkeletonTable({ rows = 3, className = '' }: SkeletonProps & { rows?: number }) {
  return (
    <div className={`bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1C1D27] flex gap-4">
        <div className="h-3 bg-[#1F2937] rounded w-20 animate-pulse" />
        <div className="h-3 bg-[#1F2937] rounded w-24 animate-pulse" />
        <div className="h-3 bg-[#1F2937] rounded w-20 animate-pulse" />
        <div className="h-3 bg-[#1F2937] rounded w-16 animate-pulse" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 border-b border-[#1C1D27] last:border-0 flex gap-4 items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-full bg-[#1F2937] animate-pulse flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3 bg-[#1F2937] rounded w-24 animate-pulse" />
              <div className="h-2.5 bg-[#1F2937] rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="h-3 bg-[#1F2937] rounded w-16 animate-pulse" />
          <div className="h-3 bg-[#1F2937] rounded w-20 animate-pulse" />
          <div className="h-3 bg-[#1F2937] rounded w-12 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
