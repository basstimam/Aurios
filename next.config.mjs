/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore optional peer dependencies from @wagmi/connectors that are not installed
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@metamask/sdk': false,
      '@safe-global/safe-apps-sdk': false,
      '@safe-global/safe-apps-provider': false,
      '@walletconnect/ethereum-provider': false,
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
    ],
  },
}

export default nextConfig
