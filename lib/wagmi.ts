import { createConfig } from '@privy-io/wagmi'
import { http, fallback } from 'wagmi'
import { base } from 'viem/chains'

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: fallback([
      http('https://base-mainnet.g.alchemy.com/v2/demo'),
      http('https://base.meowrpc.com'),
      http('https://1rpc.io/base'),
      http('https://mainnet.base.org'),
    ]),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
