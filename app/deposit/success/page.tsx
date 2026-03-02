'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { AppLayout } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
}

// ── Check Icon ────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-10 h-10 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-10 h-10 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const vaultKey = searchParams.get('vault') || 'yoUSD'
  const amount = searchParams.get('amount') || '0'
  const txHash = searchParams.get('txHash') || ''
  const isQueued = searchParams.get('queued') === 'true'
  const requestId = searchParams.get('requestId') || ''
  const sharesParam = searchParams.get('shares') || ''
  const action = searchParams.get('action') || 'deposit'
  const isRedeem = action === 'redeem'

  const vault = VAULTS[vaultKey as keyof typeof VAULTS] || VAULTS.yoUSD
  // Use shares from URL (passed from deposit flow via previewDeposit result)
  const displayShares = sharesParam || '...'
  const hasTx = txHash.length > 10 && !txHash.startsWith('0x00000000')
  const shortHash = hasTx ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : ''
  const basescanUrl = hasTx ? `https://basescan.org/tx/${txHash}` : ''

  return (
    <AppLayout>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-[600px] mx-auto px-6 py-16 text-center"
      >

        {/* Icon */}
        <motion.div variants={scaleIn} className="flex justify-center mb-6">
          {isQueued ? (
            <div className="w-20 h-20 rounded-full bg-accent-amber/10 border-2 border-accent-amber flex items-center justify-center">
              <ClockIcon />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-accent-green/10 border-2 border-accent-green flex items-center justify-center">
              <CheckIcon />
            </div>
          )}
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={fadeUp} className="font-space-grotesk text-text-primary text-3xl font-bold mb-2">
          {isQueued ? 'Redemption Queued' : isRedeem ? 'Redemption Successful!' : 'Deposit Successful!'}
        </motion.h1>
        <motion.p variants={fadeUp} className="text-text-secondary font-inter mb-8">
          {isQueued
            ? 'Your redemption request has been submitted. Funds will be available within 24-48 hours.'
            : isRedeem
              ? `Your ${vault.name} shares have been redeemed for ${vault.assetSymbol}`
              : `Your funds are now earning yield in ${vault.name}`}
        </motion.p>

        {/* Details Card */}
        <motion.div
          variants={fadeUp}
          className="bg-bg-card border border-border-default rounded-xl overflow-hidden mb-8 text-left"
        >
          {isQueued ? (
            <>
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Request ID</span>
                <span className="font-roboto-mono text-text-primary text-sm">{requestId || 'Pending'}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Vault</span>
                <span className="font-roboto-mono text-text-primary text-sm">{vault.name}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Status</span>
                <span className="font-roboto-mono text-accent-amber text-sm font-bold">Queued</span>
              </div>
              <div className="flex justify-between px-5 py-4">
                <span className="text-text-secondary text-sm font-inter">Est. Processing</span>
                <span className="font-roboto-mono text-text-primary text-sm">24-48 hours</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">{isRedeem ? 'Amount Received' : 'Amount Deposited'}</span>
                <span className="font-roboto-mono text-text-primary text-sm">{amount} {vault.assetSymbol}</span>
              </div>
              {!isRedeem && (
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Shares Received</span>
                <span className="font-roboto-mono text-text-primary text-sm">{displayShares} {vault.name}</span>
              </div>
              )}
              {isRedeem && displayShares !== '...' && (
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Shares Redeemed</span>
                <span className="font-roboto-mono text-text-primary text-sm">{displayShares} {vault.name}</span>
              </div>
              )}
              {hasTx && (
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Transaction Hash</span>
                <a
                  href={basescanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-roboto-mono text-accent-amber text-sm hover:underline"
                >
                  {shortHash}
                </a>
              </div>
              )}
              <div className="flex justify-between px-5 py-4 border-b border-border-subtle">
                <span className="text-text-secondary text-sm font-inter">Network</span>
                <span className="font-roboto-mono text-text-primary text-sm">Base</span>
              </div>
              <div className="flex justify-between px-5 py-4">
                <span className="text-text-secondary text-sm font-inter">Status</span>
                <span className="font-roboto-mono text-accent-green text-sm font-bold">Confirmed</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={stagger} className="flex flex-col gap-3">
          {hasTx && (
          <motion.a
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            href={basescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg border border-border-default text-text-secondary font-inter font-semibold hover:border-accent-amber hover:text-accent-amber transition-colors text-center"
          >
            View on BaseScan ↗
          </motion.a>
          )}
          <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-lg bg-accent-amber text-black font-semibold font-inter hover:bg-accent-amber-dark transition-colors"
          >
            Back to Dashboard
          </motion.button>
          <motion.button
            variants={fadeUp}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(isRedeem ? `/redeem?vault=${vaultKey}` : '/deposit/choose')}
            className="w-full py-3 rounded-lg border border-border-default text-text-secondary font-inter font-semibold hover:border-accent-amber hover:text-accent-amber transition-colors"
          >
            {isRedeem ? 'Redeem More' : 'Deposit More'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
      <SuccessContent />
    </Suspense>
  )
}
