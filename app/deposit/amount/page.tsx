'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { AppLayout, StepIndicator, AmountInput } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useYoClient } from '@/hooks/useYoClient'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { useVaultPaused } from '@/hooks/useVaultPaused'
import { VaultIcon } from '@/components/VaultIcon'

// ── Animation Variants ────────────────────────────────────────────────────────

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ── Vault Info text ───────────────────────────────────────────────────────────

function getVaultInfo(vaultKey: string, apyFormatted?: string, totalApyFormatted?: string): string {
  const apy = totalApyFormatted ?? apyFormatted ?? '...'
  switch (vaultKey) {
    case 'yoUSD':
      return `yoUSD earns yield on USDC deposits via YO Protocol. Current APY is ${apy}, paid continuously in yoUSD shares which appreciate against USDC over time. Suitable for stablecoin treasury reserves seeking passive yield.`
    case 'yoETH':
      return `yoETH generates ETH staking yield on WETH deposits. Current APY is ${apy}. Shares appreciate in WETH terms. Ideal for DAOs holding long-term ETH positions seeking yield without selling exposure.`
    case 'yoBTC':
      return `yoBTC earns yield on cbBTC (Coinbase BTC) deposits. Current APY is ${apy}. Shares accumulate value in BTC terms. Conservative yield strategy for DAOs preserving BTC treasury value on Base.`
    default:
      return `This vault earns yield via YO Protocol at ${apy} APY. Shares appreciate over time relative to the deposited asset.`
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a decimal string to bigint with correct decimals */
function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole = '0', fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

/** Format bigint shares to human-readable string */
function formatShares(shares: bigint, decimals: number): string {
  const precision = decimals > 6 ? 6 : decimals
  const full = formatUnits(shares, decimals)
  const [whole, frac = ''] = full.split('.')
  // Truncate, never round — prevents downstream amount mismatches
  return `${whole}.${frac.slice(0, precision).padEnd(precision, '0')}`
}

// ── Info Icon ─────────────────────────────────────────────────────────────────

function InfoIcon() {
  return (
    <svg className="w-4 h-4 text-accent-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg className="w-4 h-4 text-accent-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 6 23 6 23 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Main Content ──────────────────────────────────────────────────────────────

function EnterAmountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || ''
  const vault = VAULTS[vaultKey as VaultKey]

  const [amount, setAmount] = useState('')
  const [estimatedShares, setEstimatedShares] = useState('...')
  const [previewing, setPreviewing] = useState(false)
  const { yo } = useYoClient()
  const { address } = useAccount()
  const { data: snapshot } = useVaultSnapshot(vault?.address)
  const { data: isPaused } = useVaultPaused(vault?.address)

  // Real ERC20 balance of underlying asset
  const { data: balanceRaw } = useReadContract({
    address: vault?.asset as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!vault },
  })

  const balanceStr =
    balanceRaw != null && vault
      ? (() => {
          const precision = vault.decimals > 6 ? 6 : 2
          const full = formatUnits(balanceRaw as bigint, vault.decimals)
          const [whole, frac = ''] = full.split('.')
          // Truncate, never round — prevents depositing more than actual balance
          return `${whole}.${frac.slice(0, precision).padEnd(precision, '0')}`
        })()
      : '..'

  const parsed = parseFloat(amount)
  const isValid =
    !!vault && !isNaN(parsed) && parsed > 0 && (balanceRaw == null || parsed <= parseFloat(balanceStr))

  const insufficientBalance =
    balanceRaw != null && !isNaN(parsed) && parsed > 0 && parsed > parseFloat(balanceStr)

  // Redirect to choose if invalid vault param
  useEffect(() => {
    if (!vault) router.replace('/deposit/choose')
  }, [vault, router])

  // Real previewDeposit with 500ms debounce
  useEffect(() => {
    if (!isValid || !vault) {
      setEstimatedShares('...')
      setPreviewing(false)
      return
    }

    setPreviewing(true)
    const timer = setTimeout(async () => {
      try {
        if (yo) {
          const amountBig = parseTokenAmount(amount, vault.decimals)
          const shares = await yo.quotePreviewDeposit(vault.address, amountBig)
          setEstimatedShares(formatShares(shares, vault.decimals))
        } else {
          // No preview without SDK - show placeholder
          setEstimatedShares('...')
        }
      } catch {
        setEstimatedShares('...')
      } finally {
        setPreviewing(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [amount, isValid, yo, vault, parsed])

  // Exchange rate derived from actual previewDeposit result
  const exchangeRateStr =
    estimatedShares !== '...' && parsed > 0
      ? `1 ${vault.assetSymbol} ≈ ${(parseFloat(estimatedShares) / parsed).toFixed(
          vault.decimals > 6 ? 6 : 4
        )} ${vault.name}`
      : previewing
      ? 'Calculating...'
      : `1 ${vault.assetSymbol} ≈ ... ${vault.name}`

  const handleContinue = () => {
    if (isValid) {
      const sharesParam = estimatedShares !== '...' ? `&shares=${estimatedShares}` : ''
      router.push(`/deposit/preview?vault=${vaultKey}&amount=${amount}${sharesParam}`)
    }
  }

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[640px] mx-auto px-6 py-10"
      >
        <StepIndicator currentStep={2} />

        <motion.h1
          variants={fadeUp}
          className="font-space-grotesk text-text-primary text-2xl font-bold mt-8 mb-2"
        >
          Enter Amount
        </motion.h1>
        <motion.p variants={fadeUp} className="text-text-secondary font-inter text-sm mb-6">
          How much would you like to deposit?
        </motion.p>

        {/* Vault context label */}
        <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
          <VaultIcon assetSymbol={vault.assetSymbol} size={24} />
          <span className="text-text-primary font-inter text-sm">
            Depositing to{' '}
            <span className="font-semibold" style={{ color: vault.color }}>
              {vault.name}
            </span>
          </span>
        </motion.div>

        <motion.div variants={fadeUp}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            symbol={vault.assetSymbol}
            decimals={vault.decimals}
            balance={balanceStr}
            onMax={() =>
              balanceRaw != null
                ? setAmount(formatUnits(balanceRaw as bigint, vault.decimals))
                : undefined
            }
            error={insufficientBalance ? 'Insufficient balance' : undefined}
          />
        </motion.div>

        {/* Preview mini-card */}
        <motion.div
          variants={fadeUp}
          className="bg-bg-card border border-border-default rounded-xl p-5 mt-4 space-y-3"
        >
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">You will receive</span>
            <span className="font-roboto-mono text-text-primary text-sm">
              {previewing ? (
                <span className="text-text-secondary animate-pulse">Calculating...</span>
              ) : (
                `${estimatedShares} ${vault.name}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">Exchange rate</span>
            <span className="font-roboto-mono text-text-primary text-sm">
              {previewing ? (
                <span className="text-text-secondary animate-pulse">Calculating...</span>
              ) : (
                exchangeRateStr
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm font-inter">Current APY</span>
            <span className="font-roboto-mono text-accent-amber text-sm font-bold">
              {snapshot?.totalApyFormatted ?? '...'}
            </span>
          </div>
          {snapshot?.rewardApy != null && snapshot.rewardApy > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary text-sm font-inter">APY Breakdown</span>
              <span className="font-inter text-xs text-text-tertiary">
                {snapshot.apyFormatted} native + {snapshot.rewardApy.toFixed(0)}% reward
              </span>
            </div>
          )}
        </motion.div>

        {/* Yield Projection */}
        {parsed > 0 && !isNaN(parsed) && snapshot?.totalApy != null && snapshot.totalApy > 0 && (
          <motion.div
            variants={fadeUp}
            className="bg-bg-card border border-border-default rounded-xl p-5 mt-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingIcon />
              <span className="font-space-grotesk text-text-primary font-semibold text-sm">
                Yield Projection
              </span>
            </div>
            <div>
              {[
                { label: '1 Month', months: 1 },
                { label: '6 Months', months: 6 },
                { label: '12 Months', months: 12 },
              ].map(({ label, months }) => {
                const yieldAmt = parsed * (snapshot.totalApy / 100) * (months / 12)
                const fmt =
                  yieldAmt < 0.001
                    ? '< 0.001'
                    : yieldAmt.toLocaleString('en-US', { maximumFractionDigits: 4 })
                return (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2.5 border-b border-border-subtle last:border-0"
                  >
                    <span className="text-text-secondary text-sm font-inter">{label}</span>
                    <span className="font-roboto-mono text-sm text-accent-amber">
                      +{fmt} {vault.assetSymbol}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-text-tertiary text-xs font-inter mt-3 leading-relaxed">
              Based on current {snapshot.totalApyFormatted} APY. Actual yield may vary with market conditions.
            </p>
          </motion.div>
        )}

        {/* Vault Info card */}
        <motion.div
          variants={fadeUp}
          className="bg-bg-card border border-border-default rounded-xl p-5 mt-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <InfoIcon />
            <span className="font-space-grotesk text-text-primary font-semibold text-sm">
              Vault Info
            </span>
          </div>
          <p className="text-text-secondary text-sm font-inter leading-relaxed">
            {getVaultInfo(vaultKey, snapshot?.apyFormatted, snapshot?.totalApyFormatted)}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={!isValid || isPaused === true}
          className={`w-full mt-6 py-3 rounded-lg font-semibold font-inter transition-colors ${
            isValid && !isPaused
              ? 'bg-accent-amber text-black hover:bg-accent-amber-dark'
              : 'bg-accent-amber text-black opacity-40 cursor-not-allowed'
          }`}
        >
          {isPaused ? 'Vault is currently paused' : 'Continue to Preview →'}
        </motion.button>

        {/* Vault paused message */}
        {isPaused && (
          <motion.p
            variants={fadeUp}
            className="text-center font-inter text-sm mt-2"
            style={{ color: '#F59E0B' }}
          >
            This vault is currently paused. Deposits are temporarily disabled.
          </motion.p>
        )}

        {/* Back link */}
        <motion.button
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/deposit/choose')}
          className="w-full mt-3 text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to vault selection
        </motion.button>
      </motion.div>
    </AppLayout>
  )
}

export default function EnterAmountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-page" />}>
      <EnterAmountContent />
    </Suspense>
  )
}
