'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, StepIndicator } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useDeposit } from '@/hooks/useDeposit'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { RiskDisclosure } from '@/components/RiskDisclosure'
import { toast } from 'sonner'
import { useYoClient } from '@/hooks/useYoClient'
import { formatUnits } from 'viem'

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
  visible: { transition: { staggerChildren: 0.06 } },
}


// ── PreviewContent ────────────────────────────────────────────────────────────

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || ''
  const amount = searchParams.get('amount') || '0'
  // shares passed from amount page (real previewDeposit result)
  const sharesParam = searchParams.get('shares') || ''
  const vault = VAULTS[vaultKey as VaultKey]

  // ALL hooks MUST be called before any early return
  const { deposit, state: depositState, txHash, error: depositError } = useDeposit()
  const { data: snapshot } = useVaultSnapshot(vault?.address)
  const { yo } = useYoClient()
  const [showRisk, setShowRisk] = useState(false)
  const [liveShares, setLiveShares] = useState<string | null>(null)

  // Live gateway-aware quote as fallback/refresh
  useEffect(() => {
    if (!yo || !vault || !amount || amount === '0') return
    let cancelled = false
    ;(async () => {
      try {
        const [whole = '0', frac = ''] = amount.split('.')
        const padded = frac.padEnd(vault.decimals, '0').slice(0, vault.decimals)
        const amountBig = BigInt(whole + padded)
        const shares = await yo.quotePreviewDeposit(vault.address, amountBig)
        if (!cancelled) {
          const precision = vault.decimals > 6 ? 6 : 4
          setLiveShares(parseFloat(formatUnits(shares, vault.decimals)).toFixed(precision))
        }
      } catch { /* non-critical */ }
    })()
    return () => { cancelled = true }
  }, [yo, vault, amount])

  // Redirect to choose if invalid vault param or missing amount
  useEffect(() => {
    if (!vault) router.replace('/deposit/choose')
    else if (!amount || amount === '0' || isNaN(parseFloat(amount))) router.replace(`/deposit/amount?vault=${vaultKey}`)
  }, [vault, router, amount, vaultKey])

  // Navigate on success
  useEffect(() => {
    if (depositState === 'success' && txHash && vault) {
      toast.success('Deposit confirmed on Base')
      const sharesVal = sharesParam || liveShares || ''
      const sharesQuery = sharesVal ? `&shares=${sharesVal}` : ''
      router.push(`/deposit/success?vault=${vaultKey}&amount=${amount}&txHash=${txHash}${sharesQuery}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositState, txHash, vaultKey, amount, sharesParam, router, vault])

  // Toast on error
  useEffect(() => {
    if (depositError) toast.error(depositError)
  }, [depositError])

  // Early return AFTER all hooks
  if (!vault || !amount || amount === '0') return <div className="min-h-screen bg-bg-page" />

  const isLoading = depositState === 'approving' || depositState === 'depositing' || depositState === 'confirming'

  const apy = snapshot?.totalApyFormatted ?? '...'

  // Use sharesParam from amount page, with live gateway quote as fallback
  const bestShares = sharesParam || liveShares || ''
  const amountNum = parseFloat(amount)
  const sharesNum = parseFloat(bestShares)
  const exchangeRateStr =
    sharesNum > 0 && amountNum > 0
      ? `1 ${vault.assetSymbol} \u2248 ${(sharesNum / amountNum).toFixed(vault.decimals > 6 ? 6 : 4)} ${vault.name}`
      : liveShares === null && !sharesParam
      ? 'Calculating...'
      : `1 ${vault.assetSymbol} \u2248 ... ${vault.name}`

  const displayShares = bestShares || (liveShares === null ? 'Calculating...' : '...')

  const handleConfirm = async () => {
    setShowRisk(true)
  }

  const handleAcceptRisk = async () => {
    setShowRisk(false)
    toast.loading('Processing deposit...', { id: 'deposit-tx' })
    await deposit(vaultKey, amount)
    toast.dismiss('deposit-tx')
  }

  const detailRows: { label: string; value: string; highlight?: boolean; sub?: string }[] = [
    { label: 'Vault', value: vault.name },
    { label: 'Depositing', value: `${amount} ${vault.assetSymbol}` },
    { label: 'You will receive', value: `${displayShares} ${vault.name}` },
    { label: 'Exchange Rate', value: exchangeRateStr },
    {
      label: 'Current APY',
      value: apy,
      highlight: true,
      sub: (snapshot?.rewardApy ?? 0) > 0
        ? `${snapshot?.apyFormatted} native + ${snapshot!.rewardApy!.toFixed(0)}% Merkl rewards`
        : undefined,
    },
    { label: 'Network', value: 'Base' },
    { label: 'Estimated Gas', value: 'Paid in ETH (Base L2)' },
  ]

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[680px] mx-auto px-6 py-10"
      >
        <StepIndicator currentStep={3} />

        <motion.h1
          variants={fadeUp}
          className="font-space-grotesk text-text-primary text-2xl font-bold mt-8 mb-6"
        >
          Review Deposit
        </motion.h1>

        {/* Transaction Details Card */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="bg-bg-card border border-border-default rounded-xl overflow-hidden mb-6"
        >
          {detailRows.map((row, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex justify-between items-start px-5 py-4 border-b border-border-subtle last:border-0"
            >
              <span className="text-text-secondary text-sm font-inter">{row.label}</span>
              <div className="text-right">
                <span
                  className={`font-roboto-mono text-sm ${
                    row.highlight ? 'text-accent-amber font-bold' : 'text-text-primary'
                  }`}
                >
                  {row.value}
                </span>
                {row.sub && (
                  <p className="font-inter text-text-tertiary text-[10px] mt-0.5">
                    {row.sub}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>


        {/* Error message */}
        {depositError && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4"
          >
            <p className="text-red-400 text-sm font-inter">{depositError}</p>
          </motion.div>
        )}

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors mb-4 ${
            isLoading
              ? 'bg-accent-amber/50 text-black/50 cursor-not-allowed'
              : 'bg-accent-amber text-black hover:bg-accent-amber-dark'
          }`}
        >
          {depositState === 'approving'
            ? 'Step 1/2: Approving...'
            : depositState === 'depositing'
            ? 'Step 2/2: Depositing...'
            : depositState === 'confirming'
            ? 'Step 2/2: Confirming...'
            : 'Confirm Deposit \u2192'}
        </motion.button>

        {/* Back link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/deposit/amount?vault=${vaultKey}`)}
          className="w-full text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to amount
        </motion.button>
        <RiskDisclosure
          action="deposit"
          vaultName={vault.name}
          isOpen={showRisk}
          onAccept={handleAcceptRisk}
          onCancel={() => setShowRisk(false)}
        />
      </motion.div>
    </AppLayout>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
      <PreviewContent />
    </Suspense>
  )
}
