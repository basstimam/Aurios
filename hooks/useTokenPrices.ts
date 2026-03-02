'use client'

import { useQuery } from '@tanstack/react-query'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const IDS = 'ethereum,bitcoin,euro-coin'

export interface TokenPrices {
  ethereum: number
  bitcoin: number
  eur: number
}

export function useTokenPrices() {
  return useQuery<TokenPrices>({
    queryKey: ['tokenPrices'],
    queryFn: async () => {
      const res = await fetch(`${COINGECKO_API}/simple/price?ids=${IDS}&vs_currencies=usd`)
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
      const json = await res.json()
      return {
        ethereum: json?.ethereum?.usd ?? 0,
        bitcoin: json?.bitcoin?.usd ?? 0,
        eur: json?.['euro-coin']?.usd ?? 1,
      }
    },
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: 2,
  })
}

// Map vault address (lowercase) to CoinGecko token key
export const VAULT_PRICE_KEY: Record<string, keyof TokenPrices> = {
  '0x3a43aec53490cb9fa922847385d82fe25d0e9de7': 'ethereum',
  '0xbcbc8cb4d1e8ed048a6276a5e94a3e952660bcbc': 'bitcoin',
  '0x50c749ae210d3977adc824ae11f3c7fd10c871e9': 'eur',
}
