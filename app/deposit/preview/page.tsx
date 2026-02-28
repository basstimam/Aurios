'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout, StepIndicator } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import { useDeposit } from '@/hooks/useDeposit'

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

  return (
    <AppLayout>
      <div className="max-w-[680px] mx-auto px-6 py-10">
        <StepIndicator currentStep={3} />

        <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold mt-8 mb-6">
          Review Deposit
        </h1>

        {/* Transaction Details Card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden mb-6">
          {[
            { label: 'Vault', value: vault.name },
            { label: 'Depositing', value: `${amount} ${vault.symbol}` },
            { label: 'You will receive', value: `${estimatedShares} ${vault.name}` },
            { label: 'Exchange Rate', value: `1 ${vault.symbol} ≈ 0.98 ${vault.name}` },
            { label: 'Current APY', value: apy, highlight: true },
            { label: 'Network', value: 'Base' },
            { label: 'Estimated Gas', value: '< $0.01' },
          ].map((row, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-5 py-4 border-b border-[#1C1D27] last:border-0"
            >
              <span className="text-[#9B9081] text-sm font-inter">{row.label}</span>
              <span
                className={`font-roboto-mono text-sm ${
                  row.highlight ? 'text-[#F59E0B] font-bold' : 'text-[#F4EFE8]'
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Team Approval Section (MOCK) */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5 mb-6">
          <h3 className="font-space-grotesk text-[#F4EFE8] font-semibold mb-1">Team Approval</h3>
          <p className="text-[#9B9081] text-xs font-inter mb-4">2 of 3 approvals required</p>
          <div className="flex gap-3">
            {/* Approved member 1 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#252838] flex items-center justify-center text-xs text-[#F4EFE8] font-bold">
                  A
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              </div>
            </div>
            {/* Approved member 2 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#252838] flex items-center justify-center text-xs text-[#F4EFE8] font-bold">
                  S
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </div>
              </div>
            </div>
            {/* Pending member 3 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#252838] flex items-center justify-center text-xs text-[#9B9081] font-bold">
                  M
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#6B7280] flex items-center justify-center">
                  <span className="text-white text-[8px]">⏳</span>
                </div>
              </div>
            </div>
            <span className="text-[#9B9081] text-xs font-inter self-center ml-2">2/3 approved</span>
          </div>
        </div>

        {/* Error message */}
        {depositError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm font-inter">{depositError}</p>
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors mb-4 ${
            isLoading
              ? 'bg-[#F59E0B]/50 text-black/50 cursor-not-allowed'
              : 'bg-[#F59E0B] text-black hover:bg-[#D97706]'
          }`}
        >
          {depositState === 'approving'
            ? 'Step 1/2: Approving...'
            : depositState === 'depositing'
            ? 'Step 2/2: Depositing...'
            : depositState === 'confirming'
            ? 'Step 2/2: Confirming...'
            : 'Confirm Deposit →'}
        </button>

        {/* Back link */}
        <button
          onClick={() => router.push(`/deposit/amount?vault=${vaultKey}`)}
          className="w-full text-center text-[#9B9081] text-sm font-inter hover:text-[#F4EFE8] transition-colors"
        >
          ← Back to amount
        </button>
      </div>
    </AppLayout>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080B]" />}>
      <PreviewContent />
    </Suspense>
  )
}
