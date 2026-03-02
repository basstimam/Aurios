'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { VaultIcon } from '@/components/VaultIcon'

// ── Types ──────────────────────────────────────────────────────────────────────

type Priority = 'stability' | 'growth' | 'diversification'
type Asset = 'stablecoins' | 'eth' | 'btc'
type Horizon = 'short' | 'medium' | 'long'

interface VaultAdvisorProps {
  onSelect: (vaultName: string) => void
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Recommendation Logic ──────────────────────────────────────────────────────

interface Recommendation {
  vault: VaultKey
  reason: string
}

function getRecommendation(
  priority: Priority | null,
  asset: Asset | null,
  horizon: Horizon | null
): Recommendation {
  // Short-term always favors yoUSD for stability
  if (horizon === 'short') {
    return { vault: 'yoUSD', reason: 'For short-term holdings, stablecoin yield minimizes risk while earning consistent returns.' }
  }

  // Direct asset preference mappings
  if (asset === 'eth' && (priority === 'growth' || horizon === 'long')) {
    return { vault: 'yoETH', reason: 'ETH staking yield captures upside potential with long-term compounding.' }
  }
  if (asset === 'btc' && (priority === 'diversification' || priority === 'growth')) {
    return { vault: 'yoBTC', reason: 'BTC exposure provides portfolio diversification with conservative yield.' }
  }
  if (asset === 'stablecoins' || priority === 'stability') {
    return { vault: 'yoUSD', reason: 'Stable yield on USDC with lowest volatility, ideal for treasury reserves.' }
  }

  // Priority-based fallbacks
  if (priority === 'growth') {
    return { vault: 'yoETH', reason: 'Higher growth potential through ETH staking yields on WETH deposits.' }
  }
  if (priority === 'diversification') {
    return { vault: 'yoBTC', reason: 'Add BTC yield to your portfolio for broader asset diversification.' }
  }

  // Default
  return { vault: 'yoUSD', reason: 'Stable yield on USDC, the safest starting point for DeFi savings.' }
}

// ── Pill Button ───────────────────────────────────────────────────────────────

function Pill<T extends string>({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string
  value: T
  selected: T | null
  onSelect: (v: T) => void
}) {
  const isActive = selected === value
  return (
    <button
      onClick={() => onSelect(value)}
      className={`px-4 py-2 rounded-lg text-sm font-inter font-medium transition-colors ${
        isActive
          ? 'bg-accent-amber text-black'
          : 'border border-border-default text-text-secondary hover:border-accent-amber hover:text-accent-amber'
      }`}
    >
      {label}
    </button>
  )
}

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepDot({ active, completed }: { active: boolean; completed: boolean }) {
  return (
    <div
      className={`w-2 h-2 rounded-full transition-colors ${
        completed ? 'bg-accent-amber' : active ? 'bg-accent-amber/50' : 'bg-border-default'
      }`}
    />
  )
}

// ── VaultAdvisor Component ────────────────────────────────────────────────────

export function VaultAdvisor({ onSelect }: VaultAdvisorProps) {
  const [priority, setPriority] = useState<Priority | null>(null)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [horizon, setHorizon] = useState<Horizon | null>(null)

  // Always call all hooks (React rules)
  const { data: snapUSD } = useVaultSnapshot(VAULTS.yoUSD.address)
  const { data: snapETH } = useVaultSnapshot(VAULTS.yoETH.address)
  const { data: snapBTC } = useVaultSnapshot(VAULTS.yoBTC.address)

  const snapMap = {
    yoUSD: snapUSD,
    yoETH: snapETH,
    yoBTC: snapBTC,
  }

  const answeredCount = [priority, asset, horizon].filter(Boolean).length
  const allAnswered = answeredCount === 3

  const recommendation = useMemo(() => {
    if (!allAnswered) return null
    return getRecommendation(priority, asset, horizon)
  }, [priority, asset, horizon, allAnswered])

  const recVault = recommendation ? VAULTS[recommendation.vault] : null
  const recSnap = recommendation ? snapMap[recommendation.vault] : null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-bg-card border border-accent-amber/30 rounded-xl p-5 mb-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-accent-amber/10 flex items-center justify-center text-accent-amber">
            <SparkleIcon />
          </div>
          <div>
            <h3 className="font-space-grotesk text-text-primary font-semibold text-sm">
              Smart Vault Advisor
            </h3>
            <p className="font-inter text-text-tertiary text-xs">Answer 3 questions for a personalized recommendation</p>
          </div>
          {/* Progress dots */}
          <div className="ml-auto flex gap-1.5">
            <StepDot active={answeredCount >= 0} completed={!!priority} />
            <StepDot active={answeredCount >= 1} completed={!!asset} />
            <StepDot active={answeredCount >= 2} completed={!!horizon} />
          </div>
        </div>

        {/* Question 1: Priority */}
        <div className="mb-4">
          <p className="font-inter text-text-secondary text-xs mb-2.5 uppercase tracking-wider">
            1. What is your priority?
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Stability" value="stability" selected={priority} onSelect={setPriority} />
            <Pill label="Growth" value="growth" selected={priority} onSelect={setPriority} />
            <Pill label="Diversification" value="diversification" selected={priority} onSelect={setPriority} />
          </div>
        </div>

        {/* Question 2: Asset */}
        <div className="mb-4">
          <p className="font-inter text-text-secondary text-xs mb-2.5 uppercase tracking-wider">
            2. Preferred asset type?
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Stablecoins" value="stablecoins" selected={asset} onSelect={setAsset} />
            <Pill label="ETH" value="eth" selected={asset} onSelect={setAsset} />
            <Pill label="BTC" value="btc" selected={asset} onSelect={setAsset} />
          </div>
        </div>

        {/* Question 3: Horizon */}
        <div className="mb-4">
          <p className="font-inter text-text-secondary text-xs mb-2.5 uppercase tracking-wider">
            3. Investment horizon?
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill label="Short-term (<3mo)" value="short" selected={horizon} onSelect={setHorizon} />
            <Pill label="Medium (3-12mo)" value="medium" selected={horizon} onSelect={setHorizon} />
            <Pill label="Long-term (1yr+)" value="long" selected={horizon} onSelect={setHorizon} />
          </div>
        </div>

        {/* Recommendation */}
        <AnimatePresence>
          {allAnswered && recommendation && recVault && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="mt-5 pt-5 border-t border-border-subtle"
            >
              <div className="flex items-start gap-3">
                {/* Vault badge */}
                <VaultIcon symbol={recVault.name} size={40} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-space-grotesk text-text-primary font-semibold text-sm">
                      {recVault.name}
                    </span>
                    <span className="flex items-center gap-1 text-accent-amber">
                      <CheckIcon />
                      <span className="font-inter text-xs font-medium">Recommended</span>
                    </span>
                  </div>

                  <p className="font-inter text-text-secondary text-xs leading-relaxed mb-2">
                    {recommendation.reason}
                  </p>

                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-roboto-mono text-accent-amber text-sm font-bold">
                      {recSnap?.totalApyFormatted ?? '...'} APY
                    </span>
                    {recSnap?.rewardApy != null && recSnap.rewardApy > 0 && (
                      <span className="font-inter text-text-tertiary text-[10px]">
                        {recSnap.apyFormatted} native + {recSnap.rewardApy.toFixed(0)}% reward
                      </span>
                    )}
                    <span className="font-roboto-mono text-text-tertiary text-xs">
                      {recVault.assetSymbol} vault
                    </span>
                  </div>

                  <button
                    onClick={() => onSelect(recVault.name)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-amber text-black font-inter text-sm font-semibold hover:bg-accent-amber-dark transition-colors"
                  >
                    Select {recVault.name}
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
