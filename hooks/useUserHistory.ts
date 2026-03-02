'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'

export interface SdkHistoryEntry {
  type: string
  timestamp: number
  amount: { raw: number; formatted: string }
  shares: { raw: number; formatted: string }
  txHash: string
  vaultAddress?: string
}

export function useUserHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<SdkHistoryEntry[]>({
    queryKey: ['userHistory', vaultAddress, address],
    queryFn: async (): Promise<SdkHistoryEntry[]> => {
      if (!yo || !address) return []
      const result: unknown = await yo.getUserHistory(vaultAddress, address)
      return result as SdkHistoryEntry[]
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
