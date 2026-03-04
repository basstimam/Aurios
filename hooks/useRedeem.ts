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
const REDEEM_SLIPPAGE_RETRY_BPS = [100, 200, 400] as const

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

        const baseRedeemParams = {
          vault: vault.address,
          shares,
          owner: recipient,
          recipient,
        }

        // ── Step 1: Prepare redeem with auto-approval ─────────────────────
        // SDK checks share allowance on-chain and returns:
        //   [approveTx, redeemTx] if approval needed
        //   [redeemTx]            if already approved
        let txs = await yo.prepareRedeemWithApproval({
          ...baseRedeemParams,
          slippageBps: DEFAULT_SLIPPAGE_BPS,
        })

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
          txs = await yo.prepareRedeemWithApproval({
            ...baseRedeemParams,
            slippageBps: DEFAULT_SLIPPAGE_BPS,
          })
        }

        // ── Step 3: Send redeem transaction ───────────────────────────────
        if (txs.length !== 1) {
          throw new Error('Unexpected number of prepared transactions')
        }

        let redeemHash: `0x${string}` | null = null
        let lastError: unknown = null

        for (const slippageBps of REDEEM_SLIPPAGE_RETRY_BPS) {
          try {
            const retryTxs = await yo.prepareRedeemWithApproval({
              ...baseRedeemParams,
              slippageBps,
            })

            if (retryTxs.length !== 1) {
              throw new Error('Unexpected prepared transactions during redeem retry')
            }

            setState('redeeming')
            const redeemTx = retryTxs[0]
            const hash = await walletClient.sendTransaction({
              to: redeemTx.to,
              data: redeemTx.data,
              value: redeemTx.value,
              account: recipient,
              chain: walletClient.chain,
            })

            setState('confirming')
            setTxHash(hash)

            const receipt = await yo.waitForTransaction(hash)
            if (receipt.status === 'reverted') {
              throw new Error('Redeem transaction reverted on-chain (#1002)')
            }

            redeemHash = hash
            break
          } catch (retryError: unknown) {
            lastError = retryError
            if (isUserRejectedError(retryError) || !isSlippageError(retryError)) {
              throw retryError
            }
          }
        }

        if (!redeemHash) {
          throw new Error(
            lastError instanceof Error
              ? `Redeem failed after slippage retries: ${lastError.message}`
              : 'Redeem failed after slippage retries'
          )
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

function isSlippageError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const m = error.message.toLowerCase()
  return m.includes('#1002')
    || m.includes('insufficientassetsout')
    || m.includes('minassetsout')
    || m.includes('simulation failed')
    || m.includes('exchange rate may have changed')
}

function isUserRejectedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const m = error.message.toLowerCase()
  return m.includes('user rejected')
    || m.includes('user denied')
    || m.includes('rejected request')
    || m.includes('request rejected')
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
