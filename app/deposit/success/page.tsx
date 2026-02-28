'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components'
import { VAULTS } from '@/lib/contracts/vaults'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const vaultKey = searchParams.get('vault') || 'yoUSD'
  const amount = searchParams.get('amount') || '0'
  const txHash = searchParams.get('txHash') || '0x0000000000000000000000000000000000000000'
  const isQueued = searchParams.get('queued') === 'true'
  const requestId = searchParams.get('requestId') || ''

  const vault = VAULTS[vaultKey as keyof typeof VAULTS] || VAULTS.yoUSD
  const estimatedShares = (parseFloat(amount) * 0.98).toFixed(4)
  const shortHash = txHash.length > 10 ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : txHash
  const basescanUrl = `https://basescan.org/tx/${txHash}`

  return (
    <AppLayout>
      <div className="max-w-[600px] mx-auto px-6 py-16 text-center">

        {/* Icon */}
        {isQueued ? (
          <div className="w-20 h-20 rounded-full bg-[#1A1200] border-2 border-[#F59E0B] flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-[#0A1F0A] border-2 border-[#22C55E] flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✓</span>
          </div>
        )}

        {/* Heading */}
        <h1 className="font-space-grotesk text-[#F4EFE8] text-3xl font-bold mb-2">
          {isQueued ? 'Redemption Queued' : 'Deposit Successful!'}
        </h1>
        <p className="text-[#9B9081] font-inter mb-8">
          {isQueued
            ? 'Your redemption request has been submitted. Funds will be available within 24-48 hours.'
            : `Your funds are now earning yield in ${vault.name}`}
        </p>

        {/* Details Card */}
        <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden mb-8 text-left">
          {isQueued ? (
            <>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Request ID</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">{requestId || 'REQ-001'}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Vault</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">{vault.name}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Status</span>
                <span className="font-roboto-mono text-[#F59E0B] text-sm font-bold">Queued ⏳</span>
              </div>
              <div className="flex justify-between px-5 py-4">
                <span className="text-[#9B9081] text-sm font-inter">Est. Processing</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">24-48 hours</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Amount Deposited</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">{amount} {vault.symbol}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Shares Received</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">{estimatedShares} {vault.name}</span>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Transaction Hash</span>
                <a
                  href={basescanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-roboto-mono text-[#F59E0B] text-sm hover:underline"
                >
                  {shortHash}
                </a>
              </div>
              <div className="flex justify-between px-5 py-4 border-b border-[#1C1D27]">
                <span className="text-[#9B9081] text-sm font-inter">Network</span>
                <span className="font-roboto-mono text-[#F4EFE8] text-sm">Base</span>
              </div>
              <div className="flex justify-between px-5 py-4">
                <span className="text-[#9B9081] text-sm font-inter">Status</span>
                <span className="font-roboto-mono text-[#22C55E] text-sm font-bold">Confirmed ✓</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href={basescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg border border-[#252838] text-[#9B9081] font-inter font-semibold hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
          >
            View on BaseScan ↗
          </a>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-lg bg-[#F59E0B] text-black font-semibold font-inter hover:bg-[#D97706] transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/deposit/choose')}
            className="w-full py-3 rounded-lg border border-[#252838] text-[#9B9081] font-inter font-semibold hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
          >
            Deposit More
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080B]" />}>
      <SuccessContent />
    </Suspense>
  )
}
