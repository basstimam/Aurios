'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useYoClient } from './useYoClient'
import type { MerklChainRewards, MerklTokenReward } from '@yo-protocol/core'
import { useState } from 'react'

// ── Claimable Rewards Query ──────────────────────────────────────────────────

export function useMerklRewards() {
  const { yo } = useYoClient()
  const { address } = useAccount()

  return useQuery<MerklChainRewards | null>({
    queryKey: ['merklRewards', address],
    queryFn: async () => {
      if (!yo || !address) return null
      return await yo.getClaimableRewards(address)
    },
    enabled: !!yo && !!address,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

// ── Claim Mutation ───────────────────────────────────────────────────────────

export function useClaimMerklRewards() {
  const { yo } = useYoClient()
  const queryClient = useQueryClient()
  const { address } = useAccount()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (chainRewards: MerklChainRewards) => {
      if (!yo) throw new Error('YO client not initialized')
      return await yo.claimMerklRewards(chainRewards)
    },
    onSuccess: () => {
      setError(null)
      // Refetch rewards after successful claim
      queryClient.invalidateQueries({ queryKey: ['merklRewards', address] })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return {
    claim: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error,
    reset: () => {
      mutation.reset()
      setError(null)
    },
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getClaimableTokens(rewards: MerklChainRewards | null | undefined): MerklTokenReward[] {
  if (!rewards?.rewards) return []
  return rewards.rewards.filter((r) => {
    const amount = BigInt(r.amount)
    const claimed = BigInt(r.claimed)
    return amount > claimed
  })
}

export function formatTokenAmount(amount: string, claimed: string, decimals: number): string {
  const claimable = BigInt(amount) - BigInt(claimed)
  if (claimable <= 0n) return '0'
  const val = Number(claimable) / Math.pow(10, decimals)
  if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K`
  if (val >= 1) return val.toFixed(2)
  if (val >= 0.001) return val.toFixed(4)
  return val.toFixed(6)
}
