'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'

/** Matches @yo-protocol/core UserHistoryItem from api/types */
export interface SdkHistoryEntry {
  type: string
  network: string
  transactionHash: string
  blockTimestamp: number
  createdAt: string
  assets: { raw: string | number; formatted: string }
  shares: { raw: string | number; formatted: string }
}

export function useUserHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<SdkHistoryEntry[]>({
    queryKey: ['userHistory', vaultAddress, address],
    queryFn: async (): Promise<SdkHistoryEntry[]> => {
      if (!yo || !address) return []
      return await yo.getUserHistory(vaultAddress, address) as SdkHistoryEntry[]
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
