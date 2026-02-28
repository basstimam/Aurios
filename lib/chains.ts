export const BASE_CHAIN_ID = 8453

export const BASE_RPC_URL = 'https://mainnet.base.org'

export const BASE_EXPLORER_URL = 'https://basescan.org'

export function getExplorerTxUrl(txHash: string): string {
  return `${BASE_EXPLORER_URL}/tx/${txHash}`
}

export function getExplorerAddressUrl(address: string): string {
  return `${BASE_EXPLORER_URL}/address/${address}`
}
