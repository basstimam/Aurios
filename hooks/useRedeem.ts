'use client'

import { useState, useCallback } from 'react'
import { useYoClient } from './useYoClient'
import { VAULTS } from '@/lib/contracts/vaults'
import type { VaultKey } from '@/lib/contracts/vaults'

type RedeemState = 'idle' | 'redeeming' | 'confirming' | 'success' | 'queued' | 'error'

export function useRedeem() {
  const [state, setState] = useState<RedeemState>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isQueued, setIsQueued] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { yo, walletClient } = useYoClient()

  const redeem = useCallback(
    async (vaultKey: string, sharesString: string) => {
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
        setState('redeeming')

        const shares = parseTokenAmount(sharesString, vault.decimals)

        // Redeem via SDK
        const result = await yo.redeem({
          vault: vault.address,
          shares,
          recipient,
          slippageBps: 50,
        })

        // Wait for confirmation + check if queued or instant
        setState('confirming')
        const receipt = await yo.waitForRedeemReceipt(result.hash)

        setTxHash(result.hash)

        if (!receipt.instant) {
          setIsQueued(true)
          setRequestId(String(receipt.assetsOrRequestId))
          setState('queued')
        } else {
          setState('success')
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Transaction failed'
        setError(message)
        setState('error')
      }
    },
    [yo, walletClient]
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
