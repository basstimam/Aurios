## [2026-02-28] Tasks 5+6 — Providers + YoClient
- wagmiConfig: Base chain, injected + walletConnect connectors, SSR=true
- Providers: WagmiProvider > QueryClientProvider > RainbowKitProvider
- useYoClient: returns yo client (read-only when no wallet, write when wallet connected)
- createYoClient: partnerId=9999, publicClient cast as any for wagmi v3 compat
- **GOTCHA**: walletClient juga harus cast `as any` — viem version mismatch antara wagmi (viem@2.46.3) dan @yo-protocol/core (bundled viem berbeda). Tanpa cast, TS error panjang soal NonceManager type incompatibility.
- useVaultData: TanStack Query with 60s staleTime + refetchInterval
- useUserPosition: returns null when no wallet connected

## dashboard/page.tsx (session: 2026-02-28)
- VaultState has no apy/tvl field; use totalAssets for TVL
- tsconfig has no target set; avoid BigInt literals (0n), use BigInt(0)
- VaultCard uses isDisabled not disabled
