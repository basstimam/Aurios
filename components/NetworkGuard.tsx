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
        <div
          className="w-full border-b px-6 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'var(--accent-amber)' }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-amber flex-shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-text-primary text-sm font-inter">
              You&apos;re connected to the wrong network. Please switch to Base.
            </span>
          </div>
          <button
            onClick={() => switchChain({ chainId: base.id })}
            className="rounded-lg px-4 py-1.5 font-inter text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
          >
            Switch to Base
          </button>
        </div>
      )}
      {children}
    </>
  )
}
