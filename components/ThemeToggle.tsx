'use client'

import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-9 h-9 rounded-lg border border-border-default bg-bg-card hover:bg-bg-card-hover flex items-center justify-center transition-colors"
    >
      {theme === 'light' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 10.5A6.5 6.5 0 0 1 5.5 2a6.5 6.5 0 1 0 8.5 8.5z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="text-text-secondary"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" className="text-text-secondary" />
          <path
            d="M8 1v1M8 14v1M1 8h1M14 8h1M3.05 3.05l.7.7M12.25 12.25l.7.7M12.95 3.05l-.7.7M3.75 12.25l-.7.7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-secondary"
          />
        </svg>
      )}
    </button>
  )
}
