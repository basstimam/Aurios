'use client'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  symbol: string
  decimals: number
  balance?: string
  placeholder?: string
  disabled?: boolean
  onMax?: () => void
  error?: string
}

export function AmountInput({
  value,
  onChange,
  symbol,
  decimals,
  balance,
  placeholder = '0.00',
  disabled = false,
  onMax,
  error,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    // Allow only valid decimal input based on vault decimals
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimals}}$`)
    if (val === '' || regex.test(val)) {
      onChange(val)
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={`
          flex items-center gap-3 p-4 rounded-xl border bg-bg-card
          ${error ? 'border-accent-red' : 'border-border-default focus-within:border-accent-amber'}
          transition-colors
        `}
      >
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent text-text-primary font-roboto-mono text-2xl font-medium outline-none placeholder:text-text-muted"
        />
        <div className="flex items-center gap-2">
          {onMax && (
            <button
              onClick={onMax}
              className="px-2 py-1 text-xs font-semibold text-accent-amber border border-accent-amber rounded hover:bg-accent-amber hover:text-black transition-colors font-inter"
            >
              MAX
            </button>
          )}
          <span className="text-text-secondary font-inter font-medium text-sm">{symbol}</span>
        </div>
      </div>

      {balance && (
        <p className="text-text-muted text-xs font-inter px-1">
          Balance: <span className="font-roboto-mono">{balance}</span> {symbol}
        </p>
      )}

      {error && (
        <p className="text-accent-red text-xs font-inter px-1">{error}</p>
      )}
    </div>
  )
}
