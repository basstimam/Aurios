'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits, erc20Abi, maxUint256 } from 'viem'
import { ADDRESSES } from '@/lib/contracts/addresses'
type DepositState = 'idle' | 'approving' | 'depositing' | 'confirming' | 'success' | 'error'
export function useDeposit() {
  const [state, setState] = useState<DepositState>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { yo, walletClient } = useYoClient()
  const { address, isConnected } = useAccount()

  const deposit = useCallback(
    async (vaultKey: string, amountString: string) => {
      if (!yo || !walletClient) {
        setError(isConnected ? 'Wallet still initializing, please try again' : 'Please connect your wallet')
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

        const gatewayAddress = ADDRESSES.yoGateway

        const allowance = await yo.publicClient.readContract({
          address: vault.asset,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [recipient, gatewayAddress],
        })

        if (allowance < amount) {
          const approveTx = await walletClient.writeContract({
            address: vault.asset,
            abi: erc20Abi,
            functionName: 'approve',
            args: [gatewayAddress, maxUint256],
            account: walletClient.account!,
            chain: walletClient.chain,
          })
          await yo.publicClient.waitForTransactionReceipt({ hash: approveTx })
        }

        setState('depositing')
        const result = await yo.deposit({
          vault: vault.address,
          amount,
          recipient,
        })

        setState('confirming')
        await yo.waitForTransaction(result.hash)
        setTxHash(result.hash)

        void recordDeposit({
          wallet: recipient.toLowerCase(),
          vault,
          amount,
          txHash: result.hash,
        })

        setState('success')
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Transaction failed'
        setError(message)
        setState('error')
      }
    },
    [yo, walletClient, address, isConnected]
  )
  const reset = useCallback(() => {
    setState('idle')
    setTxHash(null)
    setError(null)
  }, [])

  const isReady = !!yo && !!walletClient
  return { deposit, state, txHash, error, reset, isReady }
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

/** Look up the user's team_id from Supabase (returns null if not in a team) */
async function lookupTeamId(wallet: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('wallet_address', wallet.toLowerCase())
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    return data?.team_id ?? null
  } catch {
    return null
  }
}
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
      team_id: await lookupTeamId(wallet),
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
    // Non-critical - don't propagate
  }
}
