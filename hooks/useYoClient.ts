'use client'

import { usePublicClient, useWalletClient } from 'wagmi'
import { useMemo } from 'react'
import { createYoClient } from '@yo-protocol/core'
import { BASE_CHAIN_ID } from '@/lib/chains'

export function useYoClient() {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID })
  const { data: walletClient } = useWalletClient()

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
