'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SavingsGoal {
  id: string
  wallet_address: string
  name: string
  vault_key: string
  vault_address: string
  target_usd: number
  monthly_deposit_usd: number
  deadline: string | null
  created_at: string
}

export interface CreateGoalInput {
  wallet_address: string
  name: string
  vault_key: string
  vault_address: string
  target_usd: number
  monthly_deposit_usd: number
  deadline?: string | null
}

export interface DeleteGoalInput {
  id: string
  wallet_address: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all savings goals for a given wallet address */
export function useSavingsGoals(walletAddress: string | undefined) {
  return useQuery<SavingsGoal[]>({
    queryKey: ['savings-goals', walletAddress?.toLowerCase()],
    queryFn: async () => {
      if (!walletAddress) return []
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []) as SavingsGoal[]
    },
    enabled: !!walletAddress,
    staleTime: 30_000,
  })
}

/** Create a new savings goal */
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          wallet_address: input.wallet_address.toLowerCase(),
          name: input.name,
          vault_key: input.vault_key,
          vault_address: input.vault_address,
          target_usd: input.target_usd,
          monthly_deposit_usd: input.monthly_deposit_usd,
          deadline: input.deadline ?? null,
        })
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data as SavingsGoal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
    },
  })
}

/** Delete a savings goal by id */
export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DeleteGoalInput) => {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', input.id)
        .eq('wallet_address', input.wallet_address.toLowerCase())
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project number of months to reach a savings target.
 * Uses compound-interest future-value formula with optional monthly deposits.
 *
 * Returns:
 *   0      — already reached
 *   number — months required (ceil)
 *   null   — impossible (no deposit, no growth, or > 50 years)
 */
export function projectMonths(params: {
  currentUsd: number
  targetUsd: number
  totalApyPercent: number
  monthlyDepositUsd: number
}): number | null {
  const { currentUsd, targetUsd, totalApyPercent, monthlyDepositUsd } = params

  // Impossible if no principal and no deposits
  if (currentUsd <= 0 && monthlyDepositUsd <= 0) return null

  // Already reached
  if (currentUsd >= targetUsd) return 0

  const monthlyRate = Math.pow(1 + totalApyPercent / 100, 1 / 12) - 1

  // Case: no monthly deposit — pure compounding
  if (monthlyDepositUsd === 0) {
    if (monthlyRate <= 0) return null
    const months = Math.log(targetUsd / currentUsd) / Math.log(1 + monthlyRate)
    return Math.ceil(months)
  }

  // Case: with monthly deposits — iterate up to 50 years (600 months)
  for (let n = 1; n <= 600; n++) {
    let fv: number
    if (monthlyRate > 1e-9) {
      const factor = Math.pow(1 + monthlyRate, n)
      fv = currentUsd * factor + monthlyDepositUsd * (factor - 1) / monthlyRate
    } else {
      // Zero / negligible APY: linear accumulation
      fv = currentUsd + monthlyDepositUsd * n
    }
    if (fv >= targetUsd) return n
  }

  return null // unreachable within 50 years
}

/**
 * Format a month count to a human-readable string.
 * Examples: "~3 months", "~2 years", "Goal reached!", "Not reachable"
 */
export function formatMonths(months: number | null): string {
  if (months === null) return 'Not reachable'
  if (months === 0) return 'Goal reached!'
  if (months < 12) return `~${months} month${months === 1 ? '' : 's'}`
  const years = Math.round(months / 12)
  return `~${years} year${years === 1 ? '' : 's'}`
}
