'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey, VaultConfig } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits } from 'viem'

type RedeemState = 'idle' | 'approving' | 'redeeming' | 'confirming' | 'success' | 'queued' | 'error'

/** Default slippage in basis points (1%) — matches official YoGateway docs example */
const DEFAULT_SLIPPAGE_BPS = 100

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

        const redeemParams = {
          vault: vault.address,
          shares,
          owner: recipient,
          recipient,
          slippageBps: DEFAULT_SLIPPAGE_BPS,
        }

        // ── Step 1: Prepare redeem with auto-approval ─────────────────────
        // SDK checks share allowance on-chain and returns:
        //   [approveTx, redeemTx] if approval needed
        //   [redeemTx]            if already approved
        let txs = await yo.prepareRedeemWithApproval(redeemParams)

        // ── Step 2: If approval needed, send it first then re-prepare ────
        // Re-preparing after approval gets a fresh quote for minAssetsOut,
        // preventing Gateway__InsufficientAssetsOut (#1002) from stale quotes
        if (txs.length > 1) {
          const approvalTx = txs[0]
          const approvalHash = await walletClient.sendTransaction({
            to: approvalTx.to,
            data: approvalTx.data,
            value: approvalTx.value,
            account: recipient,
            chain: walletClient.chain,
          })

          const approvalReceipt = await yo.waitForTransaction(approvalHash)
          if (approvalReceipt.status === 'reverted') {
            throw new Error('Share approval transaction reverted on-chain')
          }

          // Re-prepare with fresh quote (approval already done → returns [redeemTx] only)
          txs = await yo.prepareRedeemWithApproval(redeemParams)
        }

        // ── Step 3: Send redeem transaction ───────────────────────────────
        if (txs.length !== 1) {
          throw new Error('Unexpected number of prepared transactions')
        }

        setState('redeeming')
        const redeemTx = txs[0]
        const redeemHash = await walletClient.sendTransaction({
          to: redeemTx.to,
          data: redeemTx.data,
          value: redeemTx.value,
          account: recipient,
          chain: walletClient.chain,
        })

        // ── Step 4: Confirm transaction ──────────────────────────────────
        setState('confirming')
        setTxHash(redeemHash)

        const receipt = await yo.waitForTransaction(redeemHash)
        if (receipt.status === 'reverted') {
          throw new Error('Redeem transaction reverted on-chain. The vault exchange rate may have changed — please try again.')
        }

        void recordRedeem({
          wallet: recipient.toLowerCase(),
          vault,
          shares,
          txHash: redeemHash,
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
