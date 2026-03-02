'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'

export function useVaultPaused(vaultAddress: `0x${string}` | undefined) {
  const { yo } = useYoClient()

  return useQuery<boolean>({
    queryKey: ['vaultPaused', vaultAddress],
    queryFn: async (): Promise<boolean> => {
      if (!yo || !vaultAddress) return false
      const result: unknown = await yo.isPaused(vaultAddress)
      return Boolean(result)
    },
    enabled: !!yo && !!vaultAddress,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
