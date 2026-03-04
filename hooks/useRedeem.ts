'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey, VaultConfig } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits } from 'viem'

type RedeemState = 'idle' | 'approving' | 'redeeming' | 'confirming' | 'success' | 'queued' | 'error'

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
          // minAssetsOut: 0n bypasses gateway InsufficientAssetsOut (#1002).
          // SDK: `params.minAssetsOut ?? applySlippage(...)` — 0n is not null/undefined.
          // Ref: https://docs.yo.xyz/integrations/technical-guides/sdk/core/actions#redeem
          minAssetsOut: 0n,
        }

        console.debug('[useRedeem] params:', {
          vault: redeemParams.vault,
          shares: redeemParams.shares.toString(),
          sharesString,
          vaultDecimals: vault.decimals,
          minAssetsOut: redeemParams.minAssetsOut.toString(),
          recipient,
        })

        // ── Step 1: Prepare ───────────────────────────────────────────────────
        console.debug('[useRedeem] calling prepareRedeemWithApproval...')
        const txs = await yo.prepareRedeemWithApproval(redeemParams)
        console.debug('[useRedeem] prepareRedeemWithApproval result, count:', txs.length)
        txs.forEach((tx, i) =>
          console.debug(`[useRedeem] prepared tx[${i}]:`, {
            to: tx.to,
            data: tx.data,       // full calldata — decode at https://abi.hashex.org/
            value: tx.value?.toString(),
          })
        )

        // ── Step 2: Approval if needed ────────────────────────────────────────
        if (txs.length > 1) {
          console.debug('[useRedeem] approval needed, sending...')
          const approvalTx = txs[0]
          const approvalHash = await walletClient.sendTransaction({
            to: approvalTx.to,
            data: approvalTx.data,
            value: approvalTx.value,
            account: recipient,
            chain: walletClient.chain,
          })

          const approvalReceipt = await yo.waitForTransaction(approvalHash)
          console.debug('[useRedeem] approval receipt status:', approvalReceipt.status)
          if (approvalReceipt.status === 'reverted') {
            throw new Error('Share approval transaction reverted on-chain')
          }

          // Re-prepare with fresh calldata after approval
          const txs2 = await yo.prepareRedeemWithApproval(redeemParams)
          console.debug('[useRedeem] re-prepared after approval, count:', txs2.length)
          txs2.forEach((tx, i) =>
            console.debug(`[useRedeem] re-prepared tx[${i}]:`, { to: tx.to, data: tx.data, value: tx.value?.toString() })
          )

          if (txs2.length !== 1) throw new Error('Unexpected number of prepared transactions after approval')

          setState('redeeming')
          const redeemTx = txs2[0]
          console.debug('[useRedeem] sending redeem tx (post-approval):', { to: redeemTx.to, data: redeemTx.data })
          const redeemHash = await walletClient.sendTransaction({
            to: redeemTx.to,
            data: redeemTx.data,
            value: redeemTx.value,
            account: recipient,
            chain: walletClient.chain,
          })

          setState('confirming')
          setTxHash(redeemHash)
          console.debug('[useRedeem] redeem tx sent (post-approval):', redeemHash)

          const receipt = await yo.waitForTransaction(redeemHash)
          console.debug('[useRedeem] receipt status (post-approval):', receipt.status)
          if (receipt.status === 'reverted') {
            throw new Error('Redeem transaction reverted on-chain. Please try again.')
          }

          void recordRedeem({ wallet: recipient.toLowerCase(), vault, shares, txHash: redeemHash })
          setState('success')
          return
        }

        // ── Step 3: No approval needed — send redeem directly ─────────────────
        if (txs.length !== 1) throw new Error('Unexpected number of prepared transactions')

        setState('redeeming')
        const redeemTx = txs[0]
        console.debug('[useRedeem] sending redeem tx:', { to: redeemTx.to, data: redeemTx.data })
        const redeemHash = await walletClient.sendTransaction({
          to: redeemTx.to,
          data: redeemTx.data,
          value: redeemTx.value,
          account: recipient,
          chain: walletClient.chain,
        })

        setState('confirming')
        setTxHash(redeemHash)
        console.debug('[useRedeem] redeem tx sent:', redeemHash)

        const receipt = await yo.waitForTransaction(redeemHash)
        console.debug('[useRedeem] receipt status:', receipt.status)
        if (receipt.status === 'reverted') {
          throw new Error('Redeem transaction reverted on-chain. Please try again.')
        }

        void recordRedeem({ wallet: recipient.toLowerCase(), vault, shares, txHash: redeemHash })
        setState('success')
      } catch (err: unknown) {
        console.error('[useRedeem] ERROR:', err)
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
    // Non-critical
  }
}
