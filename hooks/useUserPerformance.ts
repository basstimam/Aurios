'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'

export interface UserPerformance {
  realized: { raw: number; formatted: string }
  unrealized: { raw: number; formatted: string }
}

export function useUserPerformance(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<UserPerformance | null>({
    queryKey: ['userPerformance', vaultAddress, address],
    queryFn: async (): Promise<UserPerformance | null> => {
      if (!yo || !address) return null
      const result: unknown = await yo.getUserPerformance(vaultAddress, address)
      return result as UserPerformance | null
    },
    enabled: !!yo && !!address && !!vaultAddress,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}
