'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'
import type { PendingRedeem } from '@yo-protocol/core'

export function usePendingRedemptions(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<PendingRedeem | null>({
    queryKey: ['pendingRedemptions', vaultAddress, address],
    queryFn: async () => {
      if (!yo || !address) return null
      const pending = await yo.getPendingRedemptions(vaultAddress, address)
      if (!pending?.assets && !pending?.shares) return null
      return pending
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
