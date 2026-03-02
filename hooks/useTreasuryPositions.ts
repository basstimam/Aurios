'use client'

import { useQuery } from '@tanstack/react-query'
import { useYoClient } from './useYoClient'
import { VAULTS, VAULT_LIST } from '@/lib/contracts/vaults'
import type { VaultConfig } from '@/lib/contracts/vaults'
import { formatUnits } from 'viem'

export interface VaultPosition {
  vault: VaultConfig
  totalShares: bigint
  totalAssets: bigint
  /** Human-readable asset amount */
  assetsFormatted: string
}

export interface TreasuryData {
  positions: VaultPosition[]
  /** Total in native units per vault (not USD-converted) */
  memberCount: number
}

/**
 * Fetch aggregated positions across all team members and all vaults.
 * For each (member, vault) pair, calls yo.getUserPosition() onchain.
 */
export function useTreasuryPositions(memberAddresses: string[]) {
  const { yo } = useYoClient()

  return useQuery<TreasuryData>({
    queryKey: ['treasuryPositions', memberAddresses.sort().join(',')],
    queryFn: async () => {
      if (!yo || memberAddresses.length === 0) {
        return { positions: [], memberCount: 0 }
      }

      const positions: VaultPosition[] = []

      for (const vault of VAULT_LIST) {
        let totalShares = 0n
        let totalAssets = 0n

        // Query all members in parallel per vault
        const results = await Promise.allSettled(
          memberAddresses.map(addr =>
            yo.getUserPosition(vault.address, addr as `0x${string}`)
          )
        )

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value) {
            totalShares += result.value.shares
            totalAssets += result.value.assets
          }
        }

        const raw = parseFloat(formatUnits(totalAssets, vault.decimals))
        // Use enough precision so small balances like 0.0003 are visible
        const precision = raw > 0 && raw < 0.01 ? 6 : vault.decimals > 6 ? 6 : 2
        const assetsFormatted = raw.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: precision })

        positions.push({ vault, totalShares, totalAssets, assetsFormatted })
      }

      return { positions, memberCount: memberAddresses.length }
    },
    enabled: !!yo && memberAddresses.length > 0,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
