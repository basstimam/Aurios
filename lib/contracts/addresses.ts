export const ADDRESSES = {
  yoGateway: '0xF1EeE0957267b1A474323Ff9CfF7719E964969FA' as `0x${string}`,
  vaultRegistry: '0x56c3119DC3B1a75763C87D5B0A2C55E489502232' as `0x${string}`,
} as const

export type ContractAddresses = typeof ADDRESSES
