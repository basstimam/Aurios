'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import type { Transaction, TxAction } from '@/lib/supabase'
import { formatUnits } from 'viem'

// ─────────────────────────────────────────────────────────────────────────────
// Fetch transaction history for current wallet
// ─────────────────────────────────────────────────────────────────────────────

export function useTransactions(limit = 20) {
  const { address } = useAccount()
  const wallet = address?.toLowerCase()

  return useQuery({
    queryKey: ['transactions', wallet, limit],
    queryFn: async () => {
      if (!wallet) return []

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', wallet)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw new Error(error.message)
      return (data ?? []) as Transaction[]
    },
    enabled: !!wallet,
    staleTime: 15_000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch transactions for a team
// ─────────────────────────────────────────────────────────────────────────────

export function useTeamTransactions(teamId: string | undefined, limit = 30) {
  return useQuery({
    queryKey: ['team-transactions', teamId, limit],
    queryFn: async () => {
      if (!teamId) return []

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw new Error(error.message)
      return (data ?? []) as Transaction[]
    },
    enabled: !!teamId,
    staleTime: 15_000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Record a transaction after on-chain confirmation
// ─────────────────────────────────────────────────────────────────────────────

export function useRecordTransaction() {
  const { address } = useAccount()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      vaultAddress: string
      vaultName: string
      vaultAssetSymbol: string
      vaultDecimals: number
      action: TxAction
      amountRaw: bigint
      txHash: string
      teamId?: string
    }) => {
      const wallet = address?.toLowerCase()
      if (!wallet) throw new Error('Wallet not connected')

      const amountDisplay = formatDisplay(params.amountRaw, params.vaultDecimals, params.vaultAssetSymbol)

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          wallet_address: wallet,
          team_id: params.teamId ?? null,
          vault_address: params.vaultAddress.toLowerCase(),
          vault_name: params.vaultName,
          vault_asset_symbol: params.vaultAssetSymbol,
          action: params.action,
          amount_raw: params.amountRaw.toString(),
          amount_display: amountDisplay,
          tx_hash: params.txHash,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as Transaction
    },
    onSuccess: () => {
      const wallet = address?.toLowerCase()
      qc.invalidateQueries({ queryKey: ['transactions', wallet] })
      qc.invalidateQueries({ queryKey: ['team-transactions'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format bigint amount to human readable string
// ─────────────────────────────────────────────────────────────────────────────

function formatDisplay(raw: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(raw, decimals))
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M ${symbol}`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K ${symbol}`
  return `${val.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`
}
