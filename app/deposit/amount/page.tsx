'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout, StepIndicator, AmountInput } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useYoClient } from '@/hooks/useYoClient'
import { formatUnits } from 'viem'

const AI_ADVISOR_TEXT: Record<string, string> = {
  yoUSD:
    'Based on current market conditions, yoUSD offers the best risk-adjusted yield for stablecoin deposits. The protocol maintains a consistent 8.4% APY with minimal volatility. Recommended allocation: 100% of stablecoin reserves.',
  yoETH:
    'yoETH provides competitive ETH staking yield at 5.2% APY. Ideal for DAOs with long-term ETH holdings seeking passive income without selling exposure. Consider allocating 50-70% of ETH treasury.',
  yoBTC:
    'yoBTC offers 3.8% APY on Bitcoin holdings via cbBTC. Conservative yield strategy suitable for DAOs prioritizing BTC preservation. Recommended for 30-50% of BTC reserves.',
}

const MOCK_APY: Record<string, string> = {
  yoUSD: '8.4%',
  yoETH: '5.2%',
  yoBTC: '3.8%',
}

/** Parse a decimal string to bigint with correct decimals */
function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole = '0', fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

/** Format bigint shares to human-readable string */
function formatShares(shares: bigint, decimals: number): string {
  const precision = decimals > 6 ? 6 : decimals
  return parseFloat(formatUnits(shares, decimals)).toFixed(precision)
}

function EnterAmountContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const vaultKey = searchParams.get('vault') || 'yoUSD'
  const vault = VAULTS[vaultKey as VaultKey] || VAULTS.yoUSD

  const [amount, setAmount] = useState('')
  const [estimatedShares, setEstimatedShares] = useState('—')
  const [previewing, setPreviewing] = useState(false)
  const mockBalance = '1,000.00'

  const { yo } = useYoClient()

  const parsed = parseFloat(amount)
  const isValid = !isNaN(parsed) && parsed > 0

  // Real previewDeposit with 500ms debounce
  useEffect(() => {
    if (!isValid) {
      setEstimatedShares('—')
      return
    }

    setPreviewing(true)
    const timer = setTimeout(async () => {
      try {
        if (yo) {
          const amountBig = parseTokenAmount(amount, vault.decimals)
          const shares = await yo.previewDeposit(vault.address, amountBig)
          setEstimatedShares(formatShares(shares, vault.decimals))
        } else {
          // Fallback if wallet not connected: show approximate
          setEstimatedShares((parsed * 0.98).toFixed(vault.decimals > 6 ? 6 : vault.decimals))
        }
      } catch {
        setEstimatedShares('—')
      } finally {
        setPreviewing(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [amount, isValid, yo, vault, parsed])

  const handleContinue = () => {
    if (isValid) {
      router.push(`/deposit/preview?vault=${vaultKey}&amount=${amount}`)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-[640px] mx-auto px-6 py-10">
        <StepIndicator currentStep={2} />

        <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold mt-8 mb-2">
          Enter Amount
        </h1>
        <p className="text-[#9B9081] font-inter text-sm mb-6">
          How much would you like to deposit?
        </p>

        {/* Vault context label */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
            style={{ backgroundColor: vault.color }}
          >
            {vault.assetSymbol[0]}
          </div>
          <span className="text-[#F4EFE8] font-inter text-sm">
            Depositing to{' '}
            <span className="font-semibold" style={{ color: vault.color }}>
              {vault.name}
            </span>
          </span>
        </div>

        <AmountInput
          value={amount}
          onChange={setAmount}
          symbol={vault.assetSymbol}
          decimals={vault.decimals}
          balance={mockBalance}
          onMax={() => setAmount('1000')}
        />

        {/* Preview mini-card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5 mt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              You will receive
            </span>
            <span className="font-roboto-mono text-[#F4EFE8] text-sm">
              {previewing ? (
                <span className="text-[#9B9081] animate-pulse">Calculating...</span>
              ) : (
                `${estimatedShares} ${vault.name}`
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              Exchange rate
            </span>
            <span className="font-roboto-mono text-[#F4EFE8] text-sm">
              1 {vault.assetSymbol} ≈ 0.98 {vault.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              Current APY
            </span>
            <span className="font-roboto-mono text-[#F59E0B] text-sm font-bold">
              {MOCK_APY[vaultKey] || MOCK_APY.yoUSD}
            </span>
          </div>
        </div>

        {/* AI Advisor card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="font-space-grotesk text-[#F4EFE8] font-semibold text-sm">
              AI Vault Advisor
            </span>
          </div>
          <p className="text-[#9B9081] text-sm font-inter leading-relaxed">
            {AI_ADVISOR_TEXT[vaultKey] || AI_ADVISOR_TEXT.yoUSD}
          </p>
          <p className="text-[#6B625A] text-xs font-inter mt-3">
            AI suggestions are for reference only. Not financial advice.
          </p>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`w-full mt-6 py-3 rounded-lg font-semibold font-inter transition-colors ${
            isValid
              ? 'bg-[#F59E0B] text-black hover:bg-[#D97706]'
              : 'bg-[#F59E0B] text-black opacity-40 cursor-not-allowed'
          }`}
        >
          Continue to Preview →
        </button>
      </div>
    </AppLayout>
  )
}

export default function EnterAmountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080B]" />
      }
    >
      <EnterAmountContent />
    </Suspense>
  )
}
