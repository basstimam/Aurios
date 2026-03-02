export type VaultConfig = {
  address: `0x${string}`
  asset: `0x${string}`
  name: string
  symbol: string
  assetSymbol: string
  decimals: number
  color: string
  description: string
}

export const VAULTS = {
  yoUSD: {
    address: '0x0000000f2eb9f69274678c76222b35eec7588a65' as `0x${string}`,
    asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`,
    name: 'yoUSD',
    symbol: 'yoUSD',
    assetSymbol: 'USDC',
    decimals: 6,
    color: '#F59E0B',
    description: 'Stablecoin yield on USDC',
  },
  yoETH: {
    address: '0x3a43aec53490cb9fa922847385d82fe25d0e9de7' as `0x${string}`,
    asset: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    name: 'yoETH',
    symbol: 'yoETH',
    assetSymbol: 'WETH',
    decimals: 18,
    color: '#3B82F6',
    description: 'ETH staking yield on WETH',
  },
  yoBTC: {
    address: '0xbcbc8cb4d1e8ed048a6276a5e94a3e952660bcbc' as `0x${string}`,
    asset: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' as `0x${string}`,
    name: 'yoBTC',
    symbol: 'yoBTC',
    assetSymbol: 'cbBTC',
    decimals: 8,
    color: '#22C55E',
    description: 'BTC yield on cbBTC',
  },
  yoEUR: {
    address: '0x50c749ae210d3977adc824ae11f3c7fd10c871e9' as `0x${string}`,
    asset: '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42' as `0x${string}`,
    name: 'yoEUR',
    symbol: 'yoEUR',
    assetSymbol: 'EURC',
    decimals: 6,
    color: '#8B5CF6',
    description: 'Euro stablecoin yield on EURC',
  },
} as const satisfies Record<string, VaultConfig>

export type VaultKey = keyof typeof VAULTS


export const VAULT_LIST = Object.values(VAULTS)

export function getVaultByAddress(address: string): VaultConfig | undefined {
  return VAULT_LIST.find(v => v.address.toLowerCase() === address.toLowerCase())
}

export function getVaultByKey(key: string): VaultConfig | undefined {
  return VAULTS[key as VaultKey]
}
