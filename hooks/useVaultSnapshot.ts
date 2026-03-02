'use client'

import { useQuery } from '@tanstack/react-query'
import { useTokenPrices, VAULT_PRICE_KEY } from './useTokenPrices'
import type { TokenPrices } from './useTokenPrices'

const YO_API = 'https://api.yo.xyz'

export interface VaultSnapshot {
  /** 30-day APY as percentage number, e.g. 5.73 */
  apy: number
  /** 1-day APY */
  apy1d: number
  /** 7-day APY */
  apy7d: number
  /** APY formatted string, e.g. "5.73%" */
  apyFormatted: string
  /** TVL in USD formatted, e.g. "$14.2M" */
  tvlUsd: string
  /** TVL in USD as raw number (dollars) */
  tvlRaw: number
}

function formatUsd(val: number): string {
  if (val <= 0 || isNaN(val)) return '...'
  if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`
  return `$${val.toFixed(0)}`
}

export function useVaultSnapshot(vaultAddress: `0x${string}` | undefined) {
  const { data: prices } = useTokenPrices()

  return useQuery<VaultSnapshot>({
    queryKey: ['vaultSnapshot', vaultAddress, prices?.ethereum, prices?.bitcoin],
    queryFn: async () => {
      const res = await fetch(
        `${YO_API}/api/v1/vault/base/${vaultAddress}`,
        { next: { revalidate: 0 } } as RequestInit
      )
      if (!res.ok) throw new Error(`YO API ${res.status}`)
      const json = await res.json()
      const stats = json?.data?.stats
      if (!stats) throw new Error('No stats in snapshot response')

      const parse = (v: string | null | undefined) =>
        v != null ? parseFloat(v) : 0

      const apy30d = parse(stats.yield?.['30d'])
      const apy1d  = parse(stats.yield?.['1d'])
      const apy7d  = parse(stats.yield?.['7d'])

      // TVL: native amount from API
      const tvlNative = parseFloat(stats.tvl?.formatted ?? '0')

      // Convert to USD using shared price data
      const priceKey = VAULT_PRICE_KEY[vaultAddress?.toLowerCase() ?? '']
      const price = priceKey ? (prices?.[priceKey] ?? 0) : 1 // stablecoin = 1
      const tvlUsdRaw = price > 0 ? tvlNative * price : tvlNative

      return {
        apy:          apy30d,
        apy1d,
        apy7d,
        apyFormatted: apy30d > 0 ? `${apy30d.toFixed(2)}%` : '...',
        tvlUsd:       formatUsd(tvlUsdRaw),
        tvlRaw:       tvlUsdRaw,
      }
    },
    enabled:         !!vaultAddress,
    staleTime:       300_000,
    refetchInterval: 300_000,
    retry:           1,
  })
}
