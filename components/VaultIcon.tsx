import Image from 'next/image'

const VAULT_LOGOS: Record<string, string> = {
  yoUSD: 'https://assets.coingecko.com/coins/images/55386/standard/yoUSD.png',
  yoETH: 'https://assets.coingecko.com/coins/images/54932/standard/yoETH.png',
  yoBTC: 'https://assets.coingecko.com/coins/images/55189/standard/yoBTC.png',
}

interface VaultIconProps {
  symbol?: string
  assetSymbol?: string
  size?: number
}

export function VaultIcon({ symbol, assetSymbol, size = 32 }: VaultIconProps) {
  const key = symbol ?? (assetSymbol === 'USDC' ? 'yoUSD' : assetSymbol === 'WETH' ? 'yoETH' : assetSymbol === 'cbBTC' ? 'yoBTC' : '')
  const src = VAULT_LOGOS[key]

  if (src) {
    return (
      <Image
        src={src}
        alt={key}
        width={size}
        height={size}
        className="rounded-full flex-shrink-0"
        unoptimized
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-xs font-bold font-space-grotesk bg-border-subtle text-text-secondary flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {(assetSymbol ?? symbol ?? '?')[0]}
    </div>
  )
}
