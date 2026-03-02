'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'
import { useTokenPrices, VAULT_PRICE_KEY } from './useTokenPrices'

export interface VaultTvlPoint {
  timestamp: number
  value: number
}

export function useVaultTvlHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()
  const { data: prices } = useTokenPrices()

  // Resolve price for this vault (stablecoins default to 1)
  const priceKey = VAULT_PRICE_KEY[vaultAddress.toLowerCase()]
  const price = priceKey ? (prices?.[priceKey] ?? 0) : 1

  return useQuery<VaultTvlPoint[]>({
    queryKey: ['vaultTvlHistory', vaultAddress, price],
    queryFn: async (): Promise<VaultTvlPoint[]> => {
      if (!yo) throw new Error('YO client not ready')
      const result = await yo.getVaultTvlHistory(vaultAddress) as VaultTvlPoint[]

      // Convert native token TVL to USD for non-stablecoin vaults
      if (!priceKey || price <= 0) return result

      return result.map(p => ({ timestamp: p.timestamp, value: p.value * price }))
    },
    enabled: !!yo && !!vaultAddress && (priceKey ? price > 0 : true),
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
