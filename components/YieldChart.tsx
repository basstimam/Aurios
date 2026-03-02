'use client'

import { useState } from 'react'
import { useVaultYieldHistory } from '@/hooks/useVaultYieldHistory'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'

// ── Chart constants ────────────────────────────────────────────────────────────

const VIEWBOX_W = 400
const VIEWBOX_H = 120
const PAD = { top: 16, right: 10, bottom: 8, left: 10 }
const CHART_W = VIEWBOX_W - PAD.left - PAD.right   // 380
const CHART_H = VIEWBOX_H - PAD.top - PAD.bottom   // 96

const VAULT_KEYS: VaultKey[] = ['yoUSD', 'yoETH', 'yoBTC', 'yoEUR']

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── YieldChart ────────────────────────────────────────────────────────────────

export function YieldChart() {
  const [activeVault, setActiveVault] = useState<VaultKey>('yoUSD')

  // ALL hooks called unconditionally (React rules)
  const histUSD = useVaultYieldHistory(VAULTS.yoUSD.address)
  const histETH = useVaultYieldHistory(VAULTS.yoETH.address)
  const histBTC = useVaultYieldHistory(VAULTS.yoBTC.address)
  const histEUR = useVaultYieldHistory(VAULTS.yoEUR.address)

  const histMap: Record<VaultKey, ReturnType<typeof useVaultYieldHistory>> = { yoUSD: histUSD, yoETH: histETH, yoBTC: histBTC, yoEUR: histEUR }
  const { data = [], isLoading } = histMap[activeVault]
  const vault = VAULTS[activeVault]

  // ── SVG path computation ───────────────────────────────────────────────────

  const values = data.map((d) => d.value)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 1
  const range = maxVal - minVal || 1
  const currentApy = values.length > 0 ? values[values.length - 1] : 0

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

  const gradId = `yg-${activeVault}`

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-space-grotesk text-text-primary font-semibold text-base">
            APY History
          </h3>
          <p className="font-inter text-text-tertiary text-xs mt-0.5">30-day yield performance</p>
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

      {/* Current APY */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-roboto-mono text-accent-amber text-2xl font-bold">
          {currentApy > 0 ? `${currentApy.toFixed(2)}%` : '...'}
        </span>
        <span className="font-inter text-text-tertiary text-sm">Current APY</span>
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
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

            {/* Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#F59E0B"
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
                fill="#F59E0B"
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
