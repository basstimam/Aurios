'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

/**
 * Single source of truth for wallet connection state.
 *
 * Returns true only when:
 * - Privy says user is authenticated (the auth layer)
 * - wagmi says wallet is connected (the onchain layer)
 * - address exists (sanity check)
 *
 * Using isConnected alone is not sufficient — wagmi can remain
 * connected after Privy logout, causing stale data to show.
 */
export function useWalletConnected(): boolean {
  const { authenticated } = usePrivy()
  const { isConnected, address } = useAccount()
  return authenticated && isConnected && !!address
}
