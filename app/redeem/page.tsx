'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { formatUnits } from 'viem'
import { AppLayout, AmountInput } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useRedeem } from '@/hooks/useRedeem'
import { useUserPosition } from '@/hooks/useUserPosition'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { useYoClient } from '@/hooks/useYoClient'
import { RiskDisclosure } from '@/components/RiskDisclosure'
import { toast } from 'sonner'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBalance(val: bigint, decimals: number): string {
  const precision = decimals > 6 ? 6 : 2
  return parseFloat(formatUnits(val, decimals)).toFixed(precision)
}

function RedeemContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || ''
  const vault = VAULTS[vaultKey as VaultKey]

  // ALL hooks MUST be called before any early return
  const [shares, setShares] = useState('')
  const [estimatedAssets, setEstimatedAssets] = useState('...')
  const [showRisk, setShowRisk] = useState(false)
  const { yo } = useYoClient()

  const { redeem, state: redeemState, txHash, requestId, error: redeemError } = useRedeem()
  const isProcessing = redeemState === 'approving' || redeemState === 'redeeming' || redeemState === 'confirming'

  // Real position data
  const { data: position, isLoading: posLoading } = useUserPosition(vault?.address as `0x${string}`)
  const { data: snapshot } = useVaultSnapshot(vault?.address)

  // Redirect to dashboard if invalid vault param
  useEffect(() => {
    if (!vault) router.replace('/dashboard')
  }, [vault, router])

  // Navigate on success or queued
  useEffect(() => {
    if (!vault) return
    if (redeemState === 'success' && txHash) {
      toast.success('Redemption confirmed on Base')
      // Compute estimated assets inline to avoid referencing vars declared after hooks
      const hasPos = position != null && position.shares > BigInt(0)
      const sharesFloat = parseFloat(shares)
      let estimatedAssetsVal = '...'
      if (hasPos && !isNaN(sharesFloat) && sharesFloat > 0) {
        const maxSh = parseFloat(fmtBalance(position.shares, vault.decimals))
        const totalAssets = parseFloat(fmtBalance(position.assets, vault.decimals))
        if (maxSh > 0) {
          estimatedAssetsVal = ((sharesFloat / maxSh) * totalAssets).toFixed(vault.decimals > 6 ? 6 : 2)
        }
      }
      router.push(`/deposit/success?action=redeem&vault=${vaultKey}&amount=${estimatedAssetsVal}&txHash=${txHash}&shares=${shares}`)
    } else if (redeemState === 'queued') {
      router.push(`/deposit/success?action=redeem&vault=${vaultKey}&queued=true&requestId=${requestId}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redeemState, txHash, requestId, vaultKey, router, vault, shares, position])

  // Toast on error
  useEffect(() => {
    if (redeemError) toast.error(redeemError)
  }, [redeemError])

  // Feature #2: previewRedeem with 500ms debounce
  useEffect(() => {
    if (!vault || !yo) {
      setEstimatedAssets('...')
      return
    }
    const parsedShares = parseFloat(shares)
    if (isNaN(parsedShares) || parsedShares <= 0 || !shares) {
      setEstimatedAssets('...')
      return
    }
    const timer = setTimeout(async () => {
      try {
        const [whole = '0', frac = ''] = shares.split('.')
        const padded = frac.padEnd(vault.decimals, '0').slice(0, vault.decimals)
        const sharesBigint = BigInt(whole + padded)
        const result = await yo.quotePreviewRedeem(vault.address, sharesBigint)
        const formatted = parseFloat(formatUnits(result as bigint, vault.decimals))
        setEstimatedAssets(formatted.toFixed(vault.decimals > 6 ? 6 : 2))
      } catch {
        setEstimatedAssets('...')
      }
    }, 500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shares, yo, vault])

  // Early return AFTER all hooks
  if (!vault) return <div className="min-h-screen bg-bg-page" />

  const hasPosition = position != null && position.shares > BigInt(0)

  const sharesStr = hasPosition
    ? fmtBalance(position.shares, vault.decimals)
    : '0.00'

  const assetsStr = hasPosition
    ? fmtBalance(position.assets, vault.decimals)
    : '0.00'

  const parsed = parseFloat(shares)
  const maxShares = parseFloat(sharesStr)
  const isValid = !isNaN(parsed) && parsed > 0 && parsed <= maxShares && hasPosition


  const handleConfirm = () => {
    if (isValid) setShowRisk(true)
  }

  const handleAcceptRisk = async () => {
    setShowRisk(false)
    toast.loading('Processing redemption...', { id: 'redeem-tx' })
    await redeem(vaultKey, shares)
    toast.dismiss('redeem-tx')
  }

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

          {posLoading ? (
            <div className="flex gap-3 items-center py-2">
              <div className="w-5 h-5 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
              <span className="font-inter text-text-secondary text-sm">Loading position…</span>
            </div>
          ) : !hasPosition ? (
            <p className="font-inter text-text-tertiary text-sm py-2">
              No position in {vault.name}. Deposit first to start earning yield.
            </p>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-roboto-mono text-text-primary text-2xl font-bold">
                  {sharesStr} {vault.name}
                </p>
                <p className="text-text-secondary text-sm font-inter mt-1">
                  Worth: ~{assetsStr} {vault.assetSymbol}
                </p>
              </div>
              <div className="text-right">
                <p className="font-roboto-mono text-text-secondary text-sm font-medium">
                  {(() => {
                    const assets = parseFloat(formatUnits(position.assets, vault.decimals))
                    const rate = snapshot ? snapshot.apy / 100 : 0
                    const annualYield = assets * rate
                    if (annualYield <= 0) return '...'
                    const precision = vault.decimals > 6 ? 4 : 2
                    return `${annualYield.toLocaleString('en-US', { maximumFractionDigits: precision })} ${vault.assetSymbol}`
                  })()}
                </p>
                <p className="text-text-tertiary text-xs font-inter">Est. annual yield</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Amount Input + Info - only when position exists */}
        {hasPosition && (
          <>
            <motion.div variants={fadeUp} className="mb-4">
              <label className="text-text-secondary text-sm font-inter mb-2 block">
                Shares to redeem
              </label>
              <AmountInput
                value={shares}
                onChange={setShares}
                symbol={vault.name}
                decimals={vault.decimals}
                balance={sharesStr}
                onMax={() => setShares(sharesStr)}
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
                <span className="text-text-secondary text-sm font-inter">You will receive</span>
                <span className="font-roboto-mono text-text-primary text-sm">
                  {estimatedAssets !== '...' ? `${estimatedAssets} ${vault.assetSymbol}` : '...'}
                </span>
              </motion.div>
              <motion.div variants={fadeUp} className="flex justify-between">
                <span className="text-text-secondary text-sm font-inter">Network Fee</span>
                <span className="font-roboto-mono text-text-primary text-sm">Paid in ETH (Base L2)</span>
              </motion.div>
              <motion.div variants={fadeUp} className="flex justify-between">
                <span className="text-text-secondary text-sm font-inter">Processing</span>
                <span className="font-roboto-mono text-text-secondary text-sm">Instant or up to 48h</span>
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
              {redeemState === 'approving'
                ? 'Approving...'
                : redeemState === 'redeeming'
                  ? 'Redeeming...'
                  : redeemState === 'confirming'
                    ? 'Confirming...'
                    : 'Confirm Redeem →'}
            </motion.button>
          </>
        )}

        {/* No position - show deposit CTA */}
        {!posLoading && !hasPosition && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/deposit/choose')}
            className="w-full py-3 rounded-lg bg-accent-amber text-black font-semibold font-inter hover:bg-accent-amber-dark transition-colors"
          >
            Deposit into {vault.name} →
          </motion.button>
        )}

        {/* Back link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="w-full mt-4 text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to Dashboard
        </motion.button>
        <RiskDisclosure
          action="redeem"
          vaultName={vault.name}
          isOpen={showRisk}
          onAccept={handleAcceptRisk}
          onCancel={() => setShowRisk(false)}
        />
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
