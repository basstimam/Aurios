'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ThemeToggle } from './ThemeToggle'

function HexLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M11 2L19.66 7v10L11 22 2.34 17V7L11 2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 11h8M11 7v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Team', href: '/team' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-card/80 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 text-accent-amber group">
        <span className="group-hover:scale-110 transition-transform duration-200">
          <HexLogo size={22} />
        </span>
        <span className="font-space-grotesk font-bold text-base text-text-primary tracking-tight">
          Smelt
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-inter transition-colors
                ${isActive
                  ? 'text-text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                }
              `}
            >
              {label}
              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-amber)' }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Right: Theme Toggle + Wallet */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </nav>
  )
}
