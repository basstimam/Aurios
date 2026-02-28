interface VaultCardProps {
  name: string
  assetSymbol: string
  description: string
  color: string
  apy?: string
  tvl?: string
  isSelected?: boolean
  isDisabled?: boolean
  onClick?: () => void
}

export function VaultCard({
  name,
  assetSymbol,
  description,
  color,
  apy,
  tvl,
  isSelected = false,
  isDisabled = false,
  onClick,
}: VaultCardProps) {
  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        p-5 rounded-xl border transition-all duration-150
        ${isDisabled
          ? 'border-border-subtle bg-bg-card opacity-50 cursor-not-allowed'
          : isSelected
          ? 'border-accent-amber bg-bg-card-hover cursor-pointer ring-1 ring-accent-amber'
          : 'border-border-default bg-bg-card hover:bg-bg-card-hover cursor-pointer hover:border-border-strong'
        }
      `}
    >
      {/* Vault Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-space-grotesk"
          style={{ backgroundColor: color + '22', color }}
        >
          {assetSymbol[0]}
        </div>
        <div>
          <p className="font-space-grotesk font-semibold text-text-primary text-sm">{name}</p>
          <p className="text-text-muted text-xs font-inter">{assetSymbol}</p>
        </div>
        {isSelected && (
          <div className="ml-auto w-5 h-5 rounded-full bg-accent-amber flex items-center justify-center">
            <span className="text-black text-xs font-bold">✓</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-text-secondary text-xs font-inter mb-4">{description}</p>

      {/* APY + TVL */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs font-inter mb-0.5">APY</p>
          <p className="font-roboto-mono font-medium text-accent-amber text-sm">
            {apy ?? '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-muted text-xs font-inter mb-0.5">TVL</p>
          <p className="font-roboto-mono font-medium text-text-primary text-sm">
            {tvl ?? '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
