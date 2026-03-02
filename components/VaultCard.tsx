import { VaultIcon } from './VaultIcon'

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
      role={!isDisabled ? "button" : undefined}
      tabIndex={!isDisabled ? 0 : undefined}
      onClick={!isDisabled ? onClick : undefined}
      onKeyDown={!isDisabled ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}

      className={`
        relative p-5 rounded-xl border transition-all duration-150 overflow-hidden
        ${isDisabled
          ? 'border-border-subtle bg-bg-card opacity-50 cursor-not-allowed'
          : isSelected
          ? 'border-accent-amber bg-bg-card cursor-pointer shadow-card-hover'
          : 'border-border-default bg-bg-card hover:bg-bg-card-hover cursor-pointer hover:border-border-strong hover:shadow-card'
        }
      `}
    >
      {/* Top accent stripe when selected */}
      {isSelected && (
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Vault Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <VaultIcon assetSymbol={assetSymbol} size={36} />
        <div className="min-w-0">
          <p className="font-space-grotesk font-semibold text-text-primary text-sm truncate">{name}</p>
          <p className="text-text-tertiary text-xs font-inter">{assetSymbol}</p>
        </div>
        {isSelected && (
          <div
            className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-black"
            style={{ backgroundColor: color }}
          >
            <CheckIcon />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-text-secondary text-xs font-inter mb-4 leading-relaxed">{description}</p>

      {/* APY + TVL */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-tertiary text-[10px] font-inter uppercase tracking-wider mb-0.5">APY</p>
          <p className="font-roboto-mono font-medium text-accent-amber text-sm">
            {apy ?? '...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-text-tertiary text-[10px] font-inter uppercase tracking-wider mb-0.5">TVL</p>
          <p className="font-roboto-mono font-medium text-text-primary text-sm">
            {tvl ?? '...'}
          </p>
        </div>
      </div>
    </div>
  )
}
