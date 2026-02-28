'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout, AmountInput } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { useRedeem } from '@/hooks/useRedeem'

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
      <div className="max-w-[640px] mx-auto px-6 py-10">
        <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold mb-6">
          Redeem from {vault.name}
        </h1>

        {/* Current Position Card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5 mb-6">
          <h3 className="text-[#9B9081] text-xs font-inter uppercase tracking-wider mb-3">
            Your Position
          </h3>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-roboto-mono text-[#F4EFE8] text-2xl font-bold">
                {position.shares} {vault.name}
              </p>
              <p className="text-[#9B9081] text-sm font-inter mt-1">
                Worth: ~{position.value} {vault.assetSymbol}
              </p>
            </div>
            <div className="text-right">
              <p className="font-roboto-mono text-[#22C55E] text-sm font-bold">
                {position.yield} {vault.assetSymbol}
              </p>
              <p className="text-[#6B625A] text-xs font-inter">Yield earned</p>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-[#9B9081] text-sm font-inter mb-2 block">
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
        </div>

        {/* Info Card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              You will receive
            </span>
            <span className="font-roboto-mono text-[#F4EFE8] text-sm">
              {estimatedAssets} {vault.assetSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              Exchange Rate
            </span>
            <span className="font-roboto-mono text-[#F4EFE8] text-sm">
              1 {vault.name} ≈ 1.02 {vault.assetSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              Network Fee
            </span>
            <span className="font-roboto-mono text-[#F4EFE8] text-sm">
              {'< $0.01'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9B9081] text-sm font-inter">
              Processing
            </span>
            <span className="font-roboto-mono text-[#9B9081] text-sm">
              Instant or up to 48h
            </span>
          </div>
        </div>

        {/* Error message */}
        {redeemError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm font-inter">{redeemError}</p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!isValid || isProcessing}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
            isValid && !isProcessing
              ? 'bg-[#F59E0B] text-black hover:bg-[#D97706]'
              : 'bg-[#F59E0B] text-black opacity-40 cursor-not-allowed'
          }`}
        >
          {redeemState === 'redeeming'
            ? 'Redeeming...'
            : redeemState === 'confirming'
              ? 'Confirming...'
              : 'Confirm Redeem \u2192'}
        </button>

        {/* Back link */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mt-4 text-center text-[#9B9081] text-sm font-inter hover:text-[#F4EFE8] transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>
    </AppLayout>
  )
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080B]" />}>
      <RedeemContent />
    </Suspense>
  )
}
