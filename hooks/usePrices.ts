'use client'

import { useQuery } from '@tanstack/react-query'

export interface Prices {
  ethereum: number
  bitcoin: number
}

export function usePrices() {
  return useQuery<Prices>({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd'
      )
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
      const json = await res.json()
      return {
        ethereum: json.ethereum?.usd ?? 0,
        bitcoin: json.bitcoin?.usd ?? 0,
      }
    },
    staleTime: 300_000, // 5 min
    refetchInterval: 300_000,
    retry: 2,
  })
}
