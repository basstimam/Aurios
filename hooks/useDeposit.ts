'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits } from 'viem'
type DepositState = 'idle' | 'approving' | 'depositing' | 'confirming' | 'success' | 'error'

export function useDeposit() {
  const [state, setState] = useState<DepositState>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { yo, walletClient } = useYoClient()
  const { address } = useAccount()

  const deposit = useCallback(
    async (vaultKey: string, amountString: string) => {
      if (!yo || !walletClient) {
        setError('Please connect your wallet')
        setState('error')
        return
      }

      const vault = VAULTS[vaultKey as VaultKey]
      if (!vault) {
        setError('Invalid vault')
        setState('error')
        return
      }

      const recipient = walletClient.account?.address
      if (!recipient) {
        setError('Wallet account not found')
        setState('error')
        return
      }

      try {
        setError(null)
        setState('approving')

        const amount = parseTokenAmount(amountString, vault.decimals)

        // Step 1: Approve + submit deposit tx
        const result = await yo.depositWithApproval({
          vault: vault.address,
          amount,
          recipient,
          minShares: BigInt(0),
          token: vault.asset,
        })

        // Step 2: Wait for deposit tx confirmation
        setState('depositing')
        await yo.waitForTransaction(result.depositHash)

        // Step 3: Confirming on-chain
        setState('confirming')
        await yo.waitForTransaction(result.depositHash)

        setTxHash(result.depositHash)

        // Record to Supabase (non-blocking, best-effort)
        void recordDeposit({
          wallet: walletClient.account!.address.toLowerCase(),
          vault,
          amount,
          txHash: result.depositHash,
        })

        setState('success')
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Transaction failed'
        setError(message)
        setState('error')
      }
    },
    [yo, walletClient, address]
  )
  const reset = useCallback(() => {
    setState('idle')
    setTxHash(null)
    setError(null)
  }, [])

  return { deposit, state, txHash, error, reset }
}

/** Parse a decimal string to bigint with correct decimals */
function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole = '0', fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

// ─────────────────────────────────────────────────────────────────────────────
// Record deposit to Supabase (best-effort, non-blocking)
// ─────────────────────────────────────────────────────────────────────────────

import type { VaultConfig } from '@/lib/contracts/vaults'

async function recordDeposit({
  wallet,
  vault,
  amount,
  txHash,
}: {
  wallet: string
  vault: VaultConfig
  amount: bigint
  txHash: string
}) {
  try {
    const val = parseFloat(formatUnits(amount, vault.decimals))
    const display = val >= 1_000_000
      ? `$${(val / 1_000_000).toFixed(2)}M ${vault.assetSymbol}`
      : val >= 1_000
        ? `$${(val / 1_000).toFixed(2)}K ${vault.assetSymbol}`
        : `${val.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${vault.assetSymbol}`

    await supabase.from('transactions').insert({
      wallet_address: wallet,
      team_id: null,
      vault_address: vault.address.toLowerCase(),
      vault_name: vault.name,
      vault_asset_symbol: vault.assetSymbol,
      action: 'deposit',
      amount_raw: amount.toString(),
      amount_display: display,
      tx_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
  } catch {
    // Non-critical — don't propagate
  }
}
