'use client'

import { useState } from 'react'
import { useVaultTvlHistory } from '@/hooks/useVaultTvlHistory'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'

// ── Chart constants ────────────────────────────────────────────────────────────

const VIEWBOX_W = 400
const VIEWBOX_H = 120
const PAD = { top: 16, right: 10, bottom: 8, left: 10 }
const CHART_W = VIEWBOX_W - PAD.left - PAD.right
const CHART_H = VIEWBOX_H - PAD.top - PAD.bottom

const VAULT_KEYS: VaultKey[] = ['yoUSD', 'yoETH', 'yoBTC', 'yoEUR']

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtTvl(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

// ── TvlChart ──────────────────────────────────────────────────────────────────

export function TvlChart() {
  const [activeVault, setActiveVault] = useState<VaultKey>('yoUSD')

  // ALL hooks called unconditionally (React rules)
  const histUSD = useVaultTvlHistory(VAULTS.yoUSD.address)
  const histETH = useVaultTvlHistory(VAULTS.yoETH.address)
  const histBTC = useVaultTvlHistory(VAULTS.yoBTC.address)
  const histEUR = useVaultTvlHistory(VAULTS.yoEUR.address)

  const histMap: Record<VaultKey, ReturnType<typeof useVaultTvlHistory>> = { yoUSD: histUSD, yoETH: histETH, yoBTC: histBTC, yoEUR: histEUR }
  const { data = [], isLoading } = histMap[activeVault]
  const vault = VAULTS[activeVault]

  // ── SVG path computation ───────────────────────────────────────────────────

  const values = data.map((d) => d.value)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 1
  const range = maxVal - minVal || 1
  const currentTvl = values.length > 0 ? values[values.length - 1] : 0

  const svgPts = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) : 0) * CHART_W,
    y: PAD.top + CHART_H - ((d.value - minVal) / range) * CHART_H,
    ts: d.timestamp,
    val: d.value,
  }))

  const linePath =
    svgPts.length > 0
      ? svgPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
      : ''

  const areaPath =
    svgPts.length > 0
      ? `${linePath} L${(PAD.left + CHART_W).toFixed(1)},${(PAD.top + CHART_H).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top + CHART_H).toFixed(1)} Z`
      : ''

  const gradId = `tg-${activeVault}`

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-space-grotesk text-text-primary font-semibold text-base">
            TVL History
          </h3>
          <p className="font-inter text-text-tertiary text-xs mt-0.5">Total value locked over time</p>
        </div>

        {/* Vault selector */}
        <div className="flex gap-1.5">
          {VAULT_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveVault(key)}
              className={`px-3 py-1 rounded-lg text-xs font-inter font-medium transition-colors ${
                activeVault === key
                  ? 'bg-accent-amber text-black'
                  : 'border border-border-default text-text-secondary hover:border-accent-amber hover:text-accent-amber'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Current TVL */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-roboto-mono text-accent-amber text-2xl font-bold">
          {currentTvl > 0 ? fmtTvl(currentTvl) : '...'}
        </span>
        <span className="font-inter text-text-tertiary text-sm">Current TVL</span>
        <span
          className="font-inter text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${vault.color}22`, color: vault.color }}
        >
          {vault.assetSymbol}
        </span>
      </div>

      {/* Chart area */}
      {isLoading ? (
        <div className="w-full h-28 bg-border-default rounded-lg animate-pulse" />
      ) : data.length === 0 ? (
        <div className="w-full h-28 flex items-center justify-center border border-border-subtle rounded-lg">
          <p className="font-inter text-text-tertiary text-sm">No history available</p>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            className="w-full h-28"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={vault.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={vault.color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={vault.color}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Last point dot */}
            {svgPts.length > 0 && (
              <circle
                cx={svgPts[svgPts.length - 1].x}
                cy={svgPts[svgPts.length - 1].y}
                r="3"
                fill={vault.color}
              />
            )}
          </svg>

          {/* Date range labels */}
          {svgPts.length > 1 && (
            <div className="flex justify-between mt-1">
              <span className="font-inter text-text-tertiary text-[10px]">
                {fmtDate(svgPts[0].ts)}
              </span>
              <span className="font-inter text-text-tertiary text-[10px]">
                {fmtDate(svgPts[svgPts.length - 1].ts)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
