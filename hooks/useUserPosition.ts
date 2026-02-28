'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'

export function useUserPosition(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery({
    queryKey: ['userPosition', vaultAddress, address],
    queryFn: async () => {
      if (!yo || !address) return null
      return yo.getUserPosition(vaultAddress, address)
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 30_000,
  })
}
