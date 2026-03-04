'use client'

import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { base } from 'viem/chains'
import { wagmiConfig } from '@/lib/wagmi'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from 'sonner'

// Clears React Query cache when wallet disconnects to prevent stale data
// showing after disconnect. Must be inside PrivyProvider + QueryClientProvider.
function WalletCacheGuard({ children }: { children: React.ReactNode }) {
  const { authenticated } = usePrivy()
  const qc = useQueryClient()
  const prevAuth = useRef(authenticated)

  useEffect(() => {
    // Only clear when transitioning from authenticated -> not authenticated
    if (prevAuth.current === true && authenticated === false) {
      qc.clear()
    }
    prevAuth.current = authenticated
  }, [authenticated, qc])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 2 },
    },
  }))

  return (
    <ThemeProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#D97706',
            logo: undefined,
          },
          loginMethods: ['wallet'],
          defaultChain: base,
          supportedChains: [base],
          embeddedWallets: {
            ethereum: { createOnLogin: 'off' },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
            <WalletCacheGuard>
              {children}
            </WalletCacheGuard>
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'font-inter',
                style: {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                },
              }}
            />
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  )
}
