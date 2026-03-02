'use client'

import { usePublicClient, useConnectorClient } from 'wagmi'
import { useMemo } from 'react'
import { createWalletClient, custom } from 'viem'
import { base } from 'viem/chains'
import { createYoClient } from '@yo-protocol/core'
import { BASE_CHAIN_ID } from '@/lib/chains'

export function useYoClient() {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID })
  const { data: connectorClient } = useConnectorClient({ chainId: BASE_CHAIN_ID })

  // Convert connector client to proper WalletClient with writeContract support
  const walletClient = useMemo(() => {
    if (!connectorClient?.transport) return undefined
    return createWalletClient({
      account: connectorClient.account,
      chain: base,
      transport: custom(connectorClient.transport),
    })
  }, [connectorClient])

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
