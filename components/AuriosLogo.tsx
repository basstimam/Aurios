'use client'

interface AuriosLogoProps {
  /** Height CSS class (e.g. "h-7", "h-8") */
  heightClass?: string
  /** Additional className for the wrapper */
  className?: string
}

/**
 * Aurios brand logo - transparent SVG, no background.
 * Full logo with symbol + wordmark.
 */
export function AuriosLogo({ heightClass = 'h-7', className = '' }: AuriosLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Aurios"
      className={`${heightClass} w-auto ${className}`}
    />
  )
}

/**
 * Aurios logo symbol only (no wordmark) - transparent SVG.
 * For small spaces like mobile nav or icon-only contexts.
 */
export function AuriosSymbol({ heightClass = 'h-6', className = '' }: { heightClass?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-symbol.svg"
      alt="Aurios"
      className={`${heightClass} w-auto ${className}`}
    />
  )
}
