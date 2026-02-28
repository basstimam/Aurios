'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-border-subtle bg-bg-card">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-accent-amber flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <span className="text-white font-bold text-xs font-space-grotesk">S</span>
        </div>
        <span className="font-space-grotesk font-bold text-base text-text-primary">Smelt</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-inter transition-colors">
          Dashboard
        </Link>
        <Link href="/team" className="text-text-secondary hover:text-text-primary text-sm font-inter transition-colors">
          Team
        </Link>
      </div>

      {/* Right: Theme Toggle + Wallet */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </nav>
  )
}
