'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'

export interface VaultYieldPoint {
  timestamp: number
  value: number
}

export function useVaultYieldHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()

  return useQuery<VaultYieldPoint[]>({
    queryKey: ['vaultYieldHistory', vaultAddress],
    queryFn: async (): Promise<VaultYieldPoint[]> => {
      if (!yo) throw new Error('YO client not ready')
      const result: unknown = await yo.getVaultYieldHistory(vaultAddress)
      return result as VaultYieldPoint[]
    },
    enabled: !!yo && !!vaultAddress,
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
