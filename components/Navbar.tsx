'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { ThemeToggle } from './ThemeToggle'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { VAULT_LIST } from '@/lib/contracts/vaults'


const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Team', href: '/team' },
  { label: 'Docs', href: '/docs' },
]

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function WalletButton() {
  const { ready, authenticated } = usePrivy()
  const { login } = useLogin()
  const { logout } = useLogout()
  const { address } = useAccount()

  if (!ready) {
    return (
      <div className="h-9 w-[120px] rounded-lg bg-bg-card-hover animate-pulse" />
    )
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="h-9 px-4 rounded-lg font-inter text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <button
      onClick={logout}
      className="h-9 px-4 rounded-lg border border-border-default font-roboto-mono text-xs text-text-primary hover:border-accent-amber transition-colors flex items-center gap-2"
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: 'var(--accent-green)' }}
      />
      {address ? shortAddr(address) : 'Connected'}
    </button>
  )
}

function TvlBadge() {
  const s0 = useVaultSnapshot(VAULT_LIST[0].address)
  const s1 = useVaultSnapshot(VAULT_LIST[1].address)
  const s2 = useVaultSnapshot(VAULT_LIST[2].address)
  const s3 = useVaultSnapshot(VAULT_LIST[3].address)

  const total = (s0.data?.tvlRaw ?? 0) + (s1.data?.tvlRaw ?? 0) + (s2.data?.tvlRaw ?? 0) + (s3.data?.tvlRaw ?? 0)

  const fmt = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B`
    : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K`
    : `$${v.toFixed(0)}`

  if (total <= 0) return null

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-inter font-medium"
      style={{ backgroundColor: 'rgba(217,119,6,0.10)', color: 'var(--accent-amber)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      {fmt(total)} TVL
    </div>
  )
}
export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center group hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Aurios"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* Right: Theme Toggle + TVL + Wallet + Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <TvlBadge />
          <WalletButton />
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-bg-card-hover transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-text-primary transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-subtle px-4 pb-4 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-inter transition-colors
                  ${isActive
                    ? 'text-text-primary font-medium bg-bg-card-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
