'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, AmountInput } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useRedeem } from '@/hooks/useRedeem'

// ── Animation Variants ────────────────────────────────────────────────────────

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
}

// Mock position data per vault
const MOCK_POSITIONS: Record<string, { shares: string; value: string; yield: string }> = {
  yoUSD: { shares: '1234.56', value: '1240.00', yield: '+5.44' },
  yoETH: { shares: '0.5432', value: '0.5521', yield: '+0.0089' },
  yoBTC: { shares: '0.0234', value: '0.0238', yield: '+0.0004' },
}

function RedeemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || 'yoUSD'
  const vault = VAULTS[vaultKey as VaultKey] || VAULTS.yoUSD
  const position = MOCK_POSITIONS[vaultKey] || MOCK_POSITIONS.yoUSD

  const [shares, setShares] = useState('')

  const { redeem, state: redeemState, txHash, requestId, error: redeemError } = useRedeem()
  const isProcessing = redeemState === 'redeeming' || redeemState === 'confirming'

  const parsed = parseFloat(shares)
  const maxShares = parseFloat(position.shares)
  const isValid = !isNaN(parsed) && parsed > 0 && parsed <= maxShares
  const estimatedAssets = isValid
    ? (parsed * 1.02).toFixed(vault.decimals > 6 ? 6 : vault.decimals)
    : '\u2014'

  const handleConfirm = async () => {
    if (isValid) {
      await redeem(vaultKey, shares)
    }
  }

  // Navigate on success or queued
  useEffect(() => {
    if (redeemState === 'success' && txHash) {
      router.push(`/deposit/success?vault=${vaultKey}&amount=${estimatedAssets}&txHash=${txHash}`)
    } else if (redeemState === 'queued') {
      router.push(`/deposit/success?vault=${vaultKey}&queued=true&requestId=${requestId}`)
    }
  }, [redeemState, txHash, requestId, vaultKey, estimatedAssets, router])

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[640px] mx-auto px-6 py-10"
      >
        <motion.h1
          variants={fadeUp}
          className="font-space-grotesk text-text-primary text-2xl font-bold mb-6"
        >
          Redeem from {vault.name}
        </motion.h1>

        {/* Current Position Card */}
        <motion.div
          variants={fadeUp}
          className="bg-bg-card border border-border-default rounded-xl p-5 mb-6"
        >
          <h3 className="text-text-secondary text-xs font-inter uppercase tracking-wider mb-3">
            Your Position
          </h3>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-roboto-mono text-text-primary text-2xl font-bold">
                {position.shares} {vault.name}
              </p>
              <p className="text-text-secondary text-sm font-inter mt-1">
                Worth: ~{position.value} {vault.assetSymbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-roboto-mono text-accent-green text-sm font-bold">
                {position.yield} {vault.assetSymbol}
              </p>
              <p className="text-text-tertiary text-xs font-inter">Yield earned</p>
            </div>
          </div>
        </motion.div>

        {/* Amount Input */}
        <motion.div variants={fadeUp} className="mb-4">
          <label className="text-text-secondary text-sm font-inter mb-2 block">
            Shares to redeem
          </label>
          <AmountInput
            value={shares}
            onChange={setShares}
            symbol={vault.name}
            decimals={vault.decimals}
            balance={position.shares}
            onMax={() => setShares(position.shares)}
            error={
              !isNaN(parsed) && parsed > maxShares
                ? 'Exceeds your balance'
                : undefined
            }
          />
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="bg-bg-card border border-border-default rounded-xl p-5 mb-6 space-y-3"
        >
          <motion.div variants={fadeUp} className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">
              You will receive
            </span>
            <span className="font-roboto-mono text-text-primary text-sm">
              {estimatedAssets} {vault.assetSymbol}
            </span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">
              Exchange Rate
            </span>
            <span className="font-roboto-mono text-text-primary text-sm">
              1 {vault.name} ≈ 1.02 {vault.assetSymbol}
            </span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">
              Network Fee
            </span>
            <span className="font-roboto-mono text-text-primary text-sm">
              {'< $0.01'}
            </span>
          </motion.div>
          <motion.div variants={fadeUp} className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">
              Processing
            </span>
            <span className="font-roboto-mono text-text-secondary text-sm">
              Instant or up to 48h
            </span>
          </motion.div>
        </motion.div>

        {/* Error message */}
        {redeemError && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
          >
            <p className="text-red-400 text-sm font-inter">{redeemError}</p>
          </motion.div>
        )}

        {/* Confirm Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={!isValid || isProcessing}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
            isValid && !isProcessing
              ? 'bg-accent-amber text-black hover:bg-accent-amber-dark'
              : 'bg-accent-amber text-black opacity-40 cursor-not-allowed'
          }`}
        >
          {redeemState === 'redeeming'
            ? 'Redeeming...'
            : redeemState === 'confirming'
              ? 'Confirming...'
              : 'Confirm Redeem \u2192'}
        </motion.button>

        {/* Back link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="w-full mt-4 text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>
    </AppLayout>
  )
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
      <RedeemContent />
    </Suspense>
  )
}
