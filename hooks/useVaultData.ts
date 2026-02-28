'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'

export function useVaultData(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()

  return useQuery({
    queryKey: ['vaultState', vaultAddress],
    queryFn: async () => {
      if (!yo) throw new Error('YO client not ready')
      return yo.getVaultState(vaultAddress)
    },
    enabled: !!yo && !!vaultAddress,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
