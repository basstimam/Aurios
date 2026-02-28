'use client'

import { useChainId, useSwitchChain, useAccount } from 'wagmi'
import { base } from 'wagmi/chains'

interface NetworkGuardProps {
  children: React.ReactNode
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  // Show banner only if connected to wrong chain (chainId 0 = not connected)
  const isWrongChain = isConnected && chainId !== base.id

  return (
    <>
      {isWrongChain && (
        <div className="w-full bg-[#1A0A00] border-b border-[#F59E0B] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#F59E0B] text-sm">⚠️</span>
            <span className="text-[#F4EFE8] text-sm font-inter">
              You&apos;re connected to the wrong network. Please switch to Base.
            </span>
          </div>
          <button
            onClick={() => switchChain({ chainId: base.id })}
            className="bg-[#F59E0B] text-black text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#D97706] transition-colors"
          >
            Switch to Base
          </button>
        </div>
      )}
      {children}
    </>
  )
}
