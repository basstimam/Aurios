import { createConfig } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { base } from 'viem/chains'

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
