'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-4 border-b border-border-subtle bg-bg-page">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-accent-amber flex items-center justify-center">
          <span className="text-black font-bold text-sm font-space-grotesk">S</span>
        </div>
        <span className="font-space-grotesk font-bold text-lg text-text-primary">Smelt</span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary text-sm font-inter transition-colors">
          Dashboard
        </Link>
        <Link href="/team" className="text-text-secondary hover:text-text-primary text-sm font-inter transition-colors">
          Team
        </Link>
      </div>

      {/* Wallet */}
      <ConnectButton />
    </nav>
  )
}
