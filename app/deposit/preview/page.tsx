'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, StepIndicator } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import { useDeposit } from '@/hooks/useDeposit'

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

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || 'yoUSD'
  const amount = searchParams.get('amount') || '0'
  const vault = VAULTS[vaultKey as keyof typeof VAULTS] || VAULTS.yoUSD

  const { deposit, state: depositState, txHash, error: depositError } = useDeposit()
  const isLoading = depositState === 'approving' || depositState === 'depositing' || depositState === 'confirming'

  const estimatedShares = (parseFloat(amount) * 0.98).toFixed(4)
  const apy = vaultKey === 'yoUSD' ? '8.4%' : vaultKey === 'yoETH' ? '5.2%' : '3.8%'

  const handleConfirm = async () => {
    await deposit(vaultKey, amount)
  }

  // Navigate on success
  useEffect(() => {
    if (depositState === 'success' && txHash) {
      router.push(`/deposit/success?vault=${vaultKey}&amount=${amount}&txHash=${txHash}`)
    }
  }, [depositState, txHash, vaultKey, amount, router])

  const detailRows = [
    { label: 'Vault', value: vault.name },
    { label: 'Depositing', value: `${amount} ${vault.assetSymbol}` },
    { label: 'You will receive', value: `${estimatedShares} ${vault.name}` },
    { label: 'Exchange Rate', value: `1 ${vault.assetSymbol} ≈ 0.98 ${vault.name}` },
    { label: 'Current APY', value: apy, highlight: true },
    { label: 'Network', value: 'Base' },
    { label: 'Estimated Gas', value: '< $0.01' },
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
              className="flex justify-between items-center px-5 py-4 border-b border-border-subtle last:border-0"
            >
              <span className="text-text-secondary text-sm font-inter">{row.label}</span>
              <span
                className={`font-roboto-mono text-sm ${
                  row.highlight ? 'text-accent-amber font-bold' : 'text-text-primary'
                }`}
              >
                {row.value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Approval Section (MOCK) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-bg-card border border-border-default rounded-xl p-5 mb-6"
        >
          <h3 className="font-space-grotesk text-text-primary font-semibold mb-1">Team Approval</h3>
          <p className="text-text-secondary text-xs font-inter mb-4">2 of 3 approvals required</p>
          <div className="flex gap-3">
            {/* Approved member 1 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-xs text-text-primary font-bold">
                  A
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent-green flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              </div>
            </div>
            {/* Approved member 2 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-xs text-text-primary font-bold">
                  S
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent-green flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              </div>
            </div>
            {/* Pending member 3 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-xs text-text-secondary font-bold">
                  M
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-border-strong flex items-center justify-center">
                  <span className="text-white text-[8px]">·</span>
                </div>
              </div>
            </div>
            <span className="text-text-secondary text-xs font-inter self-center ml-2">2/3 approved</span>
          </div>
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
            : 'Confirm Deposit →'}
        </motion.button>

        {/* Back link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/deposit/amount?vault=${vaultKey}`)}
          className="w-full text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to amount
        </motion.button>
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
