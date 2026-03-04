'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { useAccount } from 'wagmi'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey, VaultConfig } from '@/lib/contracts/vaults'
import { supabase } from '@/lib/supabase'
import { formatUnits, erc20Abi, maxUint256 } from 'viem'
import { ADDRESSES } from '@/lib/contracts/addresses'

type RedeemState = 'idle' | 'approving' | 'redeeming' | 'confirming' | 'success' | 'queued' | 'error'

/** Default slippage in basis points (0.5%) */
const DEFAULT_SLIPPAGE_BPS = 50

const YO_GATEWAY_ADDRESS = ADDRESSES.yoGateway

/**
 * Gateway ABI - redeem + getShareAllowance
 * The gateway has its own allowance tracking via getShareAllowance().
 * We use this instead of raw erc20.allowance() to match what the gateway checks internally.
 */
const yoGatewayAbi = [
  {
    type: 'function' as const,
    name: 'redeem' as const,
    stateMutability: 'nonpayable' as const,
    inputs: [
      { name: 'yoVault', type: 'address' as const },
      { name: 'shares', type: 'uint256' as const },
      { name: 'minAssetsOut', type: 'uint256' as const },
      { name: 'receiver', type: 'address' as const },
      { name: 'partnerId', type: 'uint32' as const },
    ],
    outputs: [{ name: 'assetsOrRequestId', type: 'uint256' as const }],
  },
  {
    type: 'function' as const,
    name: 'getShareAllowance' as const,
    stateMutability: 'view' as const,
    inputs: [
      { name: 'yoVault', type: 'address' as const },
      { name: 'owner', type: 'address' as const },
    ],
    outputs: [{ type: 'uint256' as const }],
  },
  {
    type: 'function' as const,
    name: 'quotePreviewRedeem' as const,
    stateMutability: 'view' as const,
    inputs: [
      { name: 'yoVault', type: 'address' as const },
      { name: 'shares', type: 'uint256' as const },
    ],
    outputs: [{ type: 'uint256' as const }],
  },
] as const

function applySlippage(amount: bigint, bps: number): bigint {
  return amount - (amount * BigInt(bps)) / BigInt(10000)
}

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

        // ── Step 1: Check allowance via gateway.getShareAllowance() ──────────
        // This is the authoritative check - matches what gateway reads internally.
        const gatewayAllowance = await yo.publicClient.readContract({
          address: YO_GATEWAY_ADDRESS,
          abi: yoGatewayAbi,
          functionName: 'getShareAllowance',
          args: [vault.address, recipient],
        })

        if (gatewayAllowance < shares) {
          const approveTx = await walletClient.writeContract({
            address: vault.address,
            abi: erc20Abi,
            functionName: 'approve',
            args: [YO_GATEWAY_ADDRESS, maxUint256],
            account: walletClient.account!,
            chain: walletClient.chain,
          })
          await yo.publicClient.waitForTransactionReceipt({ hash: approveTx })

          // Poll gateway allowance until it reflects the new approval
          // RPC nodes can have stale state - wait up to 5s
          let retries = 10
          let newAllowance = gatewayAllowance
          while (retries > 0) {
            await new Promise(r => setTimeout(r, 500))
            newAllowance = await yo.publicClient.readContract({
              address: YO_GATEWAY_ADDRESS,
              abi: yoGatewayAbi,
              functionName: 'getShareAllowance',
              args: [vault.address, recipient],
            })
            if (newAllowance >= shares) break
            retries--
          }

          if (newAllowance < shares) {
            throw new Error('Approval confirmed but gateway still shows insufficient allowance. Please try again.')
          }
        }

        setState('redeeming')

        // ── Step 2: Quote expected assets out (via gateway view function) ───
        const expectedAssets = await yo.publicClient.readContract({
          address: YO_GATEWAY_ADDRESS,
          abi: yoGatewayAbi,
          functionName: 'quotePreviewRedeem',
          args: [vault.address, shares],
        })
        const minAssetsOut = applySlippage(expectedAssets, DEFAULT_SLIPPAGE_BPS)

        // ── Step 3: Call gateway.redeem() directly (skip simulateContract) ─
        const hash = await walletClient.writeContract({
          address: YO_GATEWAY_ADDRESS,
          abi: yoGatewayAbi,
          functionName: 'redeem',
          args: [vault.address, shares, minAssetsOut, recipient, 9999],
          account: walletClient.account!,
          chain: walletClient.chain,
        })

        // ── Step 4: Wait for confirmation ──────────────────────────────────
        setState('confirming')

        let isInstant = false
        try {
          const redeemReceipt = await yo.waitForRedeemReceipt(hash)
          isInstant = redeemReceipt.instant
          if (!isInstant) {
            setRequestId(String(redeemReceipt.assetsOrRequestId))
          }
        } catch {
          // SDK couldn't decode YoGatewayRedeem event — tx may still have succeeded.
          // Happens when SDK ABI doesn't match the deployed gateway contract.
          // Fall back to raw receipt: if TX succeeded, treat as instant redeem
          // because the gateway.redeem() returns assets directly for instant path.
          const rawReceipt = await yo.publicClient.getTransactionReceipt({ hash })
          if (rawReceipt.status !== 'success') {
            throw new Error('Redeem transaction reverted on-chain')
          }
          // TX succeeded but SDK can't parse event — assets were received instantly.
          isInstant = true
        }

        setTxHash(hash)

        if (isInstant) {
          void recordRedeem({
            wallet: walletClient.account!.address.toLowerCase(),
            vault,
            shares: parseTokenAmount(sharesString, vault.decimals),
            txHash: hash,
          })
          setState('success')
        } else {
          setIsQueued(true)
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
