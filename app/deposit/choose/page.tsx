'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout, StepIndicator } from '@/components'

const VAULTS_DISPLAY = [
  {
    key: 'yoUSD',
    name: 'yoUSD',
    asset: 'USDC',
    description: 'Stablecoin yield',
    apy: '8.4%',
    tvl: '$4.2M',
    color: '#F59E0B',
  },
  {
    key: 'yoETH',
    name: 'yoETH',
    asset: 'WETH',
    description: 'ETH staking yield',
    apy: '5.2%',
    tvl: '$6.8M',
    color: '#3B82F6',
  },
  {
    key: 'yoBTC',
    name: 'yoBTC',
    asset: 'cbBTC',
    description: 'BTC yield',
    apy: '3.8%',
    tvl: '$3.7M',
    color: '#22C55E',
  },
]

export default function ChooseVaultPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <AppLayout>
      <div className="max-w-[700px] mx-auto px-6 py-10">
        <StepIndicator currentStep={1} />

        <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold mt-8 mb-2">
          Choose a Vault
        </h1>
        <p className="text-[#9B9081] font-inter text-sm mb-8">
          Select where you&apos;d like to deposit your treasury funds
        </p>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {VAULTS_DISPLAY.map((vault) => (
            <button
              key={vault.key}
              onClick={() => setSelected(vault.key)}
              className={`text-left p-5 rounded-xl border transition-colors ${
                selected === vault.key
                  ? 'border-[#F59E0B] bg-[#1A1500]'
                  : 'border-[#252838] bg-[#0D0E15] hover:border-[#3D3D4D]'
              }`}
            >
              {/* Vault icon circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-black font-bold text-sm"
                style={{ backgroundColor: vault.color }}
              >
                {vault.asset[0]}
              </div>
              <p className="font-space-grotesk text-[#F4EFE8] font-semibold mb-1">
                {vault.name}
              </p>
              <p className="text-[#9B9081] text-xs font-inter mb-3">
                {vault.description}
              </p>
              <div className="flex gap-4">
                <span className="text-[#F59E0B] font-roboto-mono text-sm font-bold">
                  {vault.apy} APY
                </span>
                <span className="text-[#6B625A] font-roboto-mono text-sm">
                  {vault.tvl} TVL
                </span>
              </div>
            </button>
          ))}

          {/* Coming Soon card */}
          <div className="p-5 rounded-xl border border-[#1C1D27] bg-[#0A0B10] opacity-50 cursor-not-allowed">
            <div className="w-10 h-10 rounded-full bg-[#252838] flex items-center justify-center mb-3">
              <span className="text-[#6B625A] text-lg">+</span>
            </div>
            <p className="font-space-grotesk text-[#6B625A] font-semibold mb-1">
              More Coming Soon
            </p>
            <p className="text-[#4A4A5A] text-xs font-inter">
              Additional vaults in development
            </p>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={() =>
            selected && router.push('/deposit/amount?vault=' + selected)
          }
          disabled={!selected}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
            selected
              ? 'bg-[#F59E0B] text-black hover:bg-[#D97706]'
              : 'bg-[#F59E0B] text-black opacity-40 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </AppLayout>
  )
}
