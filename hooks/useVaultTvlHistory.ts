'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'

export interface VaultTvlPoint {
  timestamp: number
  value: number
}

export function useVaultTvlHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()

  return useQuery<VaultTvlPoint[]>({
    queryKey: ['vaultTvlHistory', vaultAddress],
    queryFn: async (): Promise<VaultTvlPoint[]> => {
      if (!yo) throw new Error('YO client not ready')
      const result: unknown = await yo.getVaultTvlHistory(vaultAddress)
      return result as VaultTvlPoint[]
    },
    enabled: !!yo && !!vaultAddress,
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
