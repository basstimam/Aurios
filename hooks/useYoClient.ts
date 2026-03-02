'use client'

import { usePublicClient } from 'wagmi'
import { useMemo, useEffect, useState } from 'react'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { base } from 'viem/chains'
import { createYoClient } from '@yo-protocol/core'
import { useWallets } from '@privy-io/react-auth'
import { BASE_CHAIN_ID } from '@/lib/chains'

export function useYoClient() {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID })
  const { wallets } = useWallets()
  const [walletClient, setWalletClient] = useState<WalletClient | undefined>()

  // Get EIP-1193 provider from Privy's wallet and create a viem WalletClient.
  // This bypasses wagmi's useConnectorClient which is unreliable with Privy.
  useEffect(() => {
    let cancelled = false

    async function resolve() {
      // Find the first connected external wallet (not embedded)
      const w = wallets.find(
        (wl) => wl.walletClientType !== 'privy' && wl.chainId === `eip155:${BASE_CHAIN_ID}`
      ) ?? wallets[0]

      if (!w) {
        setWalletClient(undefined)
        return
      }

      try {
        const provider = await w.getEthereumProvider()
        if (cancelled) return

        const client = createWalletClient({
          account: w.address as `0x${string}`,
          chain: base,
          transport: custom(provider),
        })
        setWalletClient(client)
      } catch {
        if (!cancelled) setWalletClient(undefined)
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [wallets])

  const yo = useMemo(() => {
    if (!publicClient) return null
    return createYoClient({
      chainId: BASE_CHAIN_ID,
      publicClient: publicClient as any,
      walletClient: (walletClient ?? undefined) as any,
      partnerId: 9999,
    })
  }, [publicClient, walletClient])

  return { yo, walletClient, publicClient }
}
