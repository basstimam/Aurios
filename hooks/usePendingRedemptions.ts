'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'

export interface PendingRedemptions {
  assets: { raw: number; formatted: string }
  shares: { raw: number; formatted: string }
}

export function usePendingRedemptions(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<PendingRedemptions | null>({
    queryKey: ['pendingRedemptions', vaultAddress, address],
    queryFn: async (): Promise<PendingRedemptions | null> => {
      if (!yo || !address) return null
      const result: unknown = await yo.getPendingRedemptions(vaultAddress, address)
      return result as PendingRedemptions | null
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
