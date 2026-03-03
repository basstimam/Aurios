'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'
import { VAULT_LIST } from '@/lib/contracts/vaults'
import type { VaultConfig } from '@/lib/contracts/vaults'
import { formatUnits } from 'viem'

export interface MemberVaultPosition {
  vault: VaultConfig
  shares: bigint
  assets: bigint
  assetsFormatted: string
}

export interface MemberPosition {
  walletAddress: string
  displayName: string | null
  positions: MemberVaultPosition[]
  /** Total USD value across all vaults (requires prices to be passed in) */
  totalUsd: number
}

/**
 * Fetch per-member positions across all vaults.
 * Returns each member's position per vault so we can show contribution %.
 */
export function useMemberPositions(
  memberList: { walletAddress: string; displayName: string | null }[],
  prices: { [key: string]: number } | undefined,
  priceKeyMap: Record<string, string>,
) {
  const { yo } = useYoClient()

  return useQuery<MemberPosition[]>({
    queryKey: [
      'memberPositions',
      memberList.map(m => m.walletAddress).sort().join(','),
      JSON.stringify(prices ?? {}),
    ],
    queryFn: async () => {
      if (!yo || memberList.length === 0) return []

      const result: MemberPosition[] = []

      for (const member of memberList) {
        const positions: MemberVaultPosition[] = []
        let totalUsd = 0

        const vaultResults = await Promise.allSettled(
          VAULT_LIST.map(vault =>
            yo.getUserPosition(vault.address, member.walletAddress as `0x${string}`)
          )
        )

        for (let i = 0; i < VAULT_LIST.length; i++) {
          const vault = VAULT_LIST[i]
          const vaultResult = vaultResults[i]

          let shares = 0n
          let assets = 0n
          if (vaultResult.status === 'fulfilled' && vaultResult.value) {
            shares = vaultResult.value.shares
            assets = vaultResult.value.assets
          }

          const raw = parseFloat(formatUnits(assets, vault.decimals))
          const precision = raw > 0 && raw < 0.01 ? 6 : vault.decimals > 6 ? 6 : 2
          const assetsFormatted = raw.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: precision,
          })

          // USD conversion
          const priceKey = priceKeyMap[vault.address.toLowerCase()]
          const price = priceKey && prices ? prices[priceKey] : 1
          totalUsd += raw * price

          positions.push({ vault, shares, assets, assetsFormatted })
        }

        result.push({
          walletAddress: member.walletAddress,
          displayName: member.displayName,
          positions,
          totalUsd,
        })
      }

      // Sort by totalUsd descending
      result.sort((a, b) => b.totalUsd - a.totalUsd)

      return result
    },
    enabled: !!yo && memberList.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
