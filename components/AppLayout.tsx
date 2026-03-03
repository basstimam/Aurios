'use client'

import { Navbar } from './Navbar'
import { useTokenPrices } from '@/hooks/useTokenPrices'
import { NetworkGuard } from './NetworkGuard'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  // Bootstrap shared token prices into TanStack Query cache.
  // All hooks (useVaultSnapshot, useVaultTvlHistory) read from this cache.
  useTokenPrices()

  return (
    <div className="min-h-screen bg-bg-page">
      <Navbar />
      <main className="max-w-[1440px] mx-auto w-full">
        <NetworkGuard>
          {children}
        </NetworkGuard>
      </main>
    </div>
  )
}
