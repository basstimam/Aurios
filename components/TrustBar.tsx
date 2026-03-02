'use client'

import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { VAULT_LIST } from '@/lib/contracts/vaults'

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChainIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function useTotalTvl(): string {
  const s0 = useVaultSnapshot(VAULT_LIST[0].address)
  const s1 = useVaultSnapshot(VAULT_LIST[1].address)
  const s2 = useVaultSnapshot(VAULT_LIST[2].address)

  const tvls = [s0.data?.tvlUsd, s1.data?.tvlUsd, s2.data?.tvlUsd]

  // Parse "$35.7M" → number in dollars
  function parseTvl(s: string | undefined): number {
    if (!s) return 0
    const clean = s.replace(/[$,]/g, '')
    if (clean.endsWith('B')) return parseFloat(clean) * 1_000_000_000
    if (clean.endsWith('M')) return parseFloat(clean) * 1_000_000
    if (clean.endsWith('K')) return parseFloat(clean) * 1_000
    return parseFloat(clean) || 0
  }

  const total = tvls.reduce((sum, t) => sum + parseTvl(t), 0)

  if (total === 0) return '...'
  if (total >= 1_000_000_000) return `$${(total / 1_000_000_000).toFixed(2)}B`
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`
  if (total >= 1_000) return `$${(total / 1_000).toFixed(1)}K`
  return `$${total.toFixed(0)}`
}

export function TrustBar() {
  const totalTvl = useTotalTvl()

  return (
    <div className="flex items-center justify-center py-2 px-6 bg-bg-card border-b border-border-subtle">
      <div className="flex items-center gap-4 text-xs font-inter text-text-secondary">
        <span className="flex items-center gap-1.5">
          <LockIcon />
          Non-Custodial
        </span>
        <span className="text-border-default">·</span>
        <span className="flex items-center gap-1.5">
          <CheckIcon />
          Audited Protocol
        </span>
        <span className="text-border-default">·</span>
        <span className="flex items-center gap-1.5">
          <ChainIcon />
          Base Chain
        </span>
        <span className="text-border-default">·</span>
        <span
          className="font-medium px-2 py-0.5 rounded-full text-[11px]"
          style={{ backgroundColor: 'rgba(217,119,6,0.12)', color: 'var(--accent-amber)' }}
        >
          {totalTvl} TVL Protected
        </span>
      </div>
    </div>
  )
}
