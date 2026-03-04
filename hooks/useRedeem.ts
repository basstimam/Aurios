'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey, VaultConfig } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits } from 'viem'

type RedeemState = 'idle' | 'approving' | 'redeeming' | 'confirming' | 'success' | 'queued' | 'error'

/** Default slippage in basis points (0.5%) */
const DEFAULT_SLIPPAGE_BPS = 50

export function useRedeem() {
  const [state, setState] = useState<RedeemState>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isQueued, setIsQueued] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { yo, walletClient } = useYoClient()
  const { address, isConnected } = useAccount()

  const redeem = useCallback(
    async (vaultKey: string, sharesString: string) => {
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

        const shares = parseTokenAmount(sharesString, vault.decimals)

        // ── Step 1: Check share allowance and approve if needed ────────────
        const allowance = await yo.getShareAllowance(vault.address, recipient)

        if (allowance < shares) {
          await yo.approveMax(vault.address)
        }

        // ── Step 2: Redeem via SDK (handles gateway encoding, slippage) ───
        setState('redeeming')
        const result = await yo.redeem({
          vault: vault.address,
          shares,
          recipient,
          slippageBps: DEFAULT_SLIPPAGE_BPS,
        })

        // ── Step 3: Wait for confirmation ─────────────────────────────────
        setState('confirming')
        const receipt = await yo.waitForRedeemReceipt(result.hash)

        setTxHash(result.hash)

        if (receipt.instant) {
          void recordRedeem({
            wallet: recipient.toLowerCase(),
            vault,
            shares,
            txHash: result.hash,
          })
          setState('success')
        } else {
          setIsQueued(true)
          setRequestId(String(receipt.assetsOrRequestId))
          setState('queued')
        }
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
    setIsQueued(false)
    setRequestId(null)
    setError(null)
  }, [])

  return { redeem, state, txHash, isQueued, requestId, error, reset }
}

/** Parse a decimal string to bigint with correct decimals */
function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole = '0', fraction = ''] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

// ─────────────────────────────────────────────────────────────────────────────
// Record redeem to Supabase (best-effort)
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

async function recordRedeem({
  wallet,
  vault,
  shares,
  txHash,
}: {
  wallet: string
  vault: VaultConfig
  shares: bigint
  txHash: string
}) {
  try {
    const val = parseFloat(formatUnits(shares, vault.decimals))
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
      action: 'redeem',
      amount_raw: shares.toString(),
      amount_display: display,
      tx_hash: txHash,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
  } catch {
    // Non-critical - don't propagate
  }
}
