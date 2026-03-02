'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Map vault address (lowercase) to CoinGecko ID for non-stablecoin vaults
const VAULT_COINGECKO: Record<string, string> = {
  '0x3a43aec53490cb9fa922847385d82fe25d0e9de7': 'ethereum',  // yoETH
  '0xbcbc8cb4d1e8ed048a6276a5e94a3e952660bcbc': 'bitcoin',   // yoBTC
}

export interface VaultTvlPoint {
  timestamp: number
  value: number
}

async function fetchPrice(coingeckoId: string): Promise<number> {
  try {
    const res = await fetch(`${COINGECKO_API}/simple/price?ids=${coingeckoId}&vs_currencies=usd`)
    const json = await res.json()
    return json?.[coingeckoId]?.usd ?? 0
  } catch {
    return 0
  }
}

export function useVaultTvlHistory(vaultAddress: `0x${string}`) {
  const { yo } = useYoClient()

  return useQuery<VaultTvlPoint[]>({
    queryKey: ['vaultTvlHistory', vaultAddress],
    queryFn: async (): Promise<VaultTvlPoint[]> => {
      if (!yo) throw new Error('YO client not ready')
      const result = await yo.getVaultTvlHistory(vaultAddress) as VaultTvlPoint[]

      // Convert native token TVL to USD for non-stablecoin vaults
      const coingeckoId = VAULT_COINGECKO[vaultAddress.toLowerCase()]
      if (!coingeckoId) return result // stablecoin, already USD

      const price = await fetchPrice(coingeckoId)
      if (price <= 0) return result // fallback: show native

      return result.map(p => ({ timestamp: p.timestamp, value: p.value * price }))
    },
    enabled: !!yo && !!vaultAddress,
    staleTime: 300_000,
    refetchInterval: 300_000,
  })
}
