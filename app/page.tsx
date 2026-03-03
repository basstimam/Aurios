'use client'

import { useState } from 'react'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { VAULTS } from '@/lib/contracts/vaults'

import { VaultIcon } from '@/components/VaultIcon'

/* ── SVG Icons ──────────────────────────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

/* ── Animation Variants ─────────────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}



/* ── LandingNavbar ──────────────────────────────────────────────────── */
function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Vaults', href: '#vaults' },
    { label: 'Docs', href: '/docs' },
  ]

  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-border-subtle bg-bg-page"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="Aurios"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {menuLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-inter text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 font-space-grotesk text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
        >
          Launch App
        </Link>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden border-t border-border-subtle bg-bg-page"
          >
            <div className="mx-auto max-w-7xl px-6 py-4">
              <ul className="flex flex-col gap-3">
                {menuLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={handleLinkClick}
                      className="block font-inter text-sm text-text-secondary hover:text-text-primary transition-colors py-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ── HeroSection ────────────────────────────────────────────────────── */
function HeroSection({ totalTvl, heroApy, heroRewardApy }: { totalTvl?: string; heroApy?: string; heroRewardApy?: number }) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
      {/* Left */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        <motion.span
          variants={fadeUp}
          className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber"
        >
          DAO Treasury Management
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-space-grotesk text-[2.75rem] font-bold leading-[1.1] tracking-tight text-text-primary md:text-[3.25rem]"
        >
          Put idle treasury capital
          <br />
          to work on YO vaults
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-inter text-base leading-relaxed text-text-secondary max-w-md"
        >
          Aurios helps DAO operators deploy reserves into live YO vaults with clear risk
          profiles, transparent yield, and simple redeem flows.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-6 py-3 font-space-grotesk text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
          >
            Launch App
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-border-default px-6 py-3 font-space-grotesk text-sm font-semibold text-text-primary hover:border-accent-amber hover:text-accent-amber transition-colors"
          >
            View Docs
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-center gap-6 pt-1"
        >
          {[
            { icon: <ShieldIcon />, label: 'Audited Protocol' },
            { icon: <CheckIcon />, label: 'Non-Custodial' },
            { icon: <ChainIcon />, label: 'On-Chain Verified' },
          ].map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1.5 font-inter text-xs text-text-tertiary"
            >
              <span className="text-text-secondary">{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Right - floating card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
        className="flex justify-center md:justify-end"
      >
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full max-w-sm rounded-2xl border border-border-default bg-bg-card p-6 flex flex-col gap-5 shadow-card-hover"
        >
          <div className="flex items-center justify-between">
            <span className="font-space-grotesk text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Live Snapshot
            </span>
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-roboto-mono text-xs font-medium"
              style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: 'var(--accent-green)' }}
            >
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--accent-green)' }} />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ backgroundColor: 'var(--accent-green)' }} />
              </span>
              Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5">
              <span className="font-inter text-xs text-text-secondary">Total TVL</span>
              <span className="font-roboto-mono text-sm text-text-primary">{totalTvl ?? '...'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5">
              <span className="font-inter text-xs text-text-secondary">Best APY</span>
              <span className="font-roboto-mono text-sm text-accent-amber">{heroApy ?? '...'}</span>
            </div>
            {heroRewardApy != null && heroRewardApy > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5">
                <span className="font-inter text-xs text-text-secondary">Includes Reward APY</span>
                <span className="font-roboto-mono text-sm text-accent-green">+{heroRewardApy.toFixed(0)}%</span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2.5">
              <span className="font-inter text-xs text-text-secondary">Network</span>
              <span className="font-roboto-mono text-sm text-text-primary">Base Mainnet</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-4 font-inter text-xs text-text-secondary">
            <span>Status: Live</span>
            <span className="text-border-strong">|</span>
            <span>Custody: Non-custodial</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function StatsStrip({ realTvl, avgApy, avgTotalApy }: { realTvl?: string; avgApy?: number; avgTotalApy?: number }) {
  const avgApyLabel = avgApy != null ? `${avgApy.toFixed(2)}%` : '...'
  const avgTotalLabel = avgTotalApy != null ? `${avgTotalApy.toFixed(2)}%` : '...'

  const items = [
    { label: 'Total TVL', value: realTvl ?? '...' },
    { label: 'Avg Native APY', value: avgApyLabel },
    { label: 'Avg Total APY', value: avgTotalLabel },
    { label: 'Active Vaults', value: '4' },
  ]

  return (
    <section className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-border-subtle bg-bg-page px-4 py-3.5">
            <p className="font-inter text-[11px] uppercase tracking-wider text-text-tertiary">{item.label}</p>
            <p className="mt-1 font-roboto-mono text-lg text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── OpportunitySection ─────────────────────────────────────────────── */
function OpportunitySection() {
  const steps = [
    {
      icon: <BuildingIcon />,
      title: '1. Choose Vault',
      desc: 'Select yoUSD, yoETH, or yoBTC based on your treasury policy and risk mandate.',
    },
    {
      icon: <ZapIcon />,
      title: '2. Deposit Funds',
      desc: 'Execute one onchain deposit flow from your wallet with transparent confirmations.',
    },
    {
      icon: <BarChartIcon />,
      title: '3. Track and Redeem',
      desc: 'Monitor APY, TVL, and history in dashboard, then redeem assets when needed.',
    },
  ]

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.p
          variants={fadeUp}
          className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber mb-3"
        >
          How It Works
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-space-grotesk text-3xl font-bold leading-tight text-text-primary md:text-4xl"
        >
          A clean 3-step treasury flow
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-3 max-w-2xl font-inter text-base leading-relaxed text-text-secondary"
        >
          No complex setup. No hidden mechanics. Just vault selection, deposit execution,
          and clear portfolio tracking.
        </motion.p>

        <motion.div variants={stagger} className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="rounded-xl border border-border-subtle bg-bg-card p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-accent-amber">
                {step.icon}
              </span>
              <p className="mt-4 font-space-grotesk text-sm font-semibold text-text-primary">{step.title}</p>
              <p className="mt-1.5 font-inter text-sm leading-relaxed text-text-secondary">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── FeaturesSection ────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: <LockIcon />,
      title: 'Non-Custodial',
      desc: 'Your keys, your assets. Aurios never holds funds directly.',
    },
    {
      icon: <GridIcon />,
      title: 'Multi-Asset',
      desc: 'Deposit yoUSD, yoETH, or yoBTC into optimized yield strategies.',
    },
    {
      icon: <UsersIcon />,
      title: 'DAO-Native',
      desc: 'Built for treasury management. Governance-ready from day one.',
    },
    {
      icon: <TrendingIcon />,
      title: 'Transparent Yield',
      desc: 'Every basis point of yield is traceable onchain.',
    },
  ]

  return (
    <section id="features" className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.p
            variants={fadeUp}
            className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber text-center mb-3"
          >
            Platform
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl mb-14 text-center"
          >
            Everything your treasury needs
          </motion.h2>

          <motion.div variants={stagger} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-xl border border-border-subtle bg-bg-page p-6 flex flex-col gap-4 cursor-default"
              >
                <span className="text-accent-amber">{f.icon}</span>
                <div>
                  <p className="font-space-grotesk text-base font-semibold text-text-primary">
                    {f.title}
                  </p>
                  <p className="font-inter text-sm leading-relaxed text-text-secondary mt-1.5">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── VaultSection ───────────────────────────────────────────────────── */
interface LandingVault {
  name: string
  asset: string
  apy: string
  rewardApy: string
  totalApy: string
  risk: string
  status: string
  accent: string
  tvl?: string
  minDeposit: string
}

function VaultSection({ vaults }: { vaults: LandingVault[] }) {
  return (
    <section id="vaults" className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <motion.p
          variants={fadeUp}
          className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber mb-3"
        >
          Vaults
        </motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl mb-10"
        >
          Compare vault options
        </motion.h2>

        <motion.div variants={stagger} className="flex flex-col gap-3">
          {vaults.map((v) => (
            <motion.div
              key={v.name}
              variants={fadeLeft}
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden hover:border-border-default hover:shadow-card transition-all"
            >
              <div className="flex">
                <div className="w-1 flex-shrink-0" style={{ backgroundColor: v.accent }} />
                <div className="flex flex-col gap-4 px-6 py-5 flex-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 sm:w-48">
                    <VaultIcon symbol={v.name.split(' ')[0]} size={32} />
                    <div>
                      <span className="font-space-grotesk text-sm font-semibold text-text-primary block">
                        {v.name}
                      </span>
                      <span className="font-roboto-mono text-xs text-text-tertiary">{v.asset}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[10px] text-text-tertiary uppercase tracking-wider">Total APY</span>
                      <span className="font-roboto-mono text-lg font-semibold text-accent-amber">
                        {v.totalApy}
                      </span>
                      {v.rewardApy !== '0.00%' && (
                        <span className="font-inter text-[10px] text-text-tertiary">
                          {v.apy} + {v.rewardApy} reward
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[10px] text-text-tertiary uppercase tracking-wider">TVL</span>
                      <span className="font-roboto-mono text-sm text-text-secondary">
                        {v.tvl ?? (
                          <span className="inline-block w-16 h-4 rounded bg-border-subtle animate-pulse" />
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[10px] text-text-tertiary uppercase tracking-wider">Min Deposit</span>
                      <span className="font-roboto-mono text-sm text-text-secondary">{v.minDeposit}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[10px] text-text-tertiary uppercase tracking-wider">Risk</span>
                      <span
                        className="rounded px-2 py-0.5 font-inter text-xs font-medium"
                        style={{
                          backgroundColor: v.risk === 'Low' ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)',
                          color: v.risk === 'Low' ? 'var(--accent-green)' : 'var(--accent-amber)',
                        }}
                      >
                        {v.risk}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[10px] text-text-tertiary uppercase tracking-wider">Status</span>
                      <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 font-inter text-xs"
                        style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--accent-green)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent-green)' }} />
                        {v.status}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/deposit/choose"
                    className="rounded-lg border border-border-default px-5 py-2 font-inter text-xs font-medium text-text-primary hover:border-accent-amber hover:text-accent-amber transition-colors text-center sm:text-left"
                  >
                    Deposit
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── BenchmarkSection ──────────────────────────────────────────────── */
function BenchmarkSection({ yoTotalApy }: { yoTotalApy: number | undefined }) {
  const currentApy = yoTotalApy ?? 0
  const comparisons = [
    { label: 'Aurios (yoUSD)', apy: currentApy, tag: 'Native + Reward APY', isAccent: true },
    { label: 'US High-Yield Savings', apy: 4.5, tag: 'Off-Chain', isAccent: false },
    { label: 'Traditional Savings', apy: 0.5, tag: 'Off-Chain', isAccent: false },
  ]
  const maxApy = Math.max(currentApy, 4.5, 0.5)
  return (
    <section className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.p variants={fadeUp} className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber mb-3">
            Yield Benchmark
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl mb-3">
            How does Aurios compare?
          </motion.h2>
          <motion.p variants={fadeUp} className="font-inter text-base text-text-secondary mb-10 max-w-xl">
            YO vaults deliver institutional-grade yield accessible to any DAO or wallet.
          </motion.p>
          <motion.div variants={stagger} className="space-y-5">
            {comparisons.map((row) => {
              const barWidth = maxApy > 0 ? (row.apy / maxApy) * 100 : 0
              return (
                <motion.div key={row.label} variants={fadeUp} className="flex items-center gap-4">
                  <div className="w-52 flex-shrink-0">
                    <p className={`font-space-grotesk text-sm font-semibold ${row.isAccent ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {row.label}
                    </p>
                    <span className={`font-inter text-xs ${row.isAccent ? 'text-accent-amber' : 'text-text-tertiary'}`}>
                      {row.tag}
                    </span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 bg-border-subtle rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${barWidth}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: row.isAccent ? 'var(--accent-amber)' : 'var(--border-strong)' }}
                      />
                    </div>
                    <span className={`font-roboto-mono text-sm w-16 text-right font-bold ${row.isAccent ? 'text-accent-amber' : 'text-text-secondary'}`}>
                      {row.isAccent ? (currentApy > 0 ? `${currentApy.toFixed(2)}%` : '...') : `${row.apy.toFixed(1)}%`}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
          <motion.p variants={fadeUp} className="font-inter text-xs text-text-tertiary mt-8">
            APY based on 30-day trailing data from YO Protocol. Traditional savings rates based on US market averages. Past performance does not guarantee future results.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── FinalCTA ───────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col items-center text-center gap-6"
        >
          <motion.p
            variants={fadeUp}
            className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber"
          >
            Get Started
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl max-w-xl"
          >
            Ready to put your treasury to work?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-inter text-base text-text-secondary max-w-sm"
          >
            Join DAOs already earning real yield with Aurios. One transaction to deploy.
          </motion.p>
          <motion.div variants={fadeUp}>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                className="inline-block rounded-lg px-8 py-3.5 font-space-grotesk text-base font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
              >
                Launch App
              </Link>
            </motion.div>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="font-inter text-xs text-text-tertiary"
          >
            Non-custodial &middot; Audited &middot; On-Chain Verified
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-page">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Aurios"
              className="h-6 w-auto"
            />
          </div>
          <p className="font-inter text-sm text-text-secondary max-w-[200px]">
            Institutional-grade savings for DAO treasuries.
          </p>
          <p className="font-inter text-xs text-text-tertiary">
            Powered by{' '}
            <span className="text-accent-amber font-medium">YO Protocol</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-center">
          <p className="font-inter text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Navigate
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Vaults', href: '#vaults' },
              { label: 'Features', href: '#features' },
              { label: 'Docs', href: '/docs' },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-inter text-sm text-text-secondary hover:text-accent-amber transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <p className="font-inter text-sm text-text-secondary">Built for DoraHacks 2026</p>
          <p className="font-inter text-xs text-text-tertiary">
            &copy; 2026 Aurios. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { data: snapUSD } = useVaultSnapshot(VAULTS.yoUSD.address)
  const { data: snapETH } = useVaultSnapshot(VAULTS.yoETH.address)
  const { data: snapBTC } = useVaultSnapshot(VAULTS.yoBTC.address)
  const { data: snapEUR } = useVaultSnapshot(VAULTS.yoEUR.address)

  // Total TVL in USD across all 4 vaults
  const totalTvlUsd = (snapUSD && snapETH && snapBTC && snapEUR)
    ? snapUSD.tvlRaw + snapETH.tvlRaw + snapBTC.tvlRaw + snapEUR.tvlRaw
    : undefined

  const fmtTotalTvl = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B`
    : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K`
    : `$${v.toFixed(0)}`

  const totalTvlFormatted = totalTvlUsd != null ? fmtTotalTvl(totalTvlUsd) : undefined

  const apyUSD = snapUSD?.totalApyFormatted
  const apyETH = snapETH?.totalApyFormatted
  const apyBTC = snapBTC?.totalApyFormatted
  const apyEUR = snapEUR?.totalApyFormatted

  const avgApy = (snapUSD && snapETH && snapBTC && snapEUR)
    ? (snapUSD.apy + snapETH.apy + snapBTC.apy + snapEUR.apy) / 4
    : undefined

  const avgTotalApy = (snapUSD && snapETH && snapBTC && snapEUR)
    ? (snapUSD.totalApy + snapETH.totalApy + snapBTC.totalApy + snapEUR.totalApy) / 4
    : undefined

  const bestTotalApy = (snapUSD && snapETH && snapBTC && snapEUR)
    ? Math.max(snapUSD.totalApy, snapETH.totalApy, snapBTC.totalApy, snapEUR.totalApy)
    : undefined

  const bestRewardApy = (snapUSD && snapETH && snapBTC && snapEUR)
    ? Math.max(snapUSD.rewardApy, snapETH.rewardApy, snapBTC.rewardApy, snapEUR.rewardApy)
    : undefined

  const liveVaults: LandingVault[] = [
    {
      name: 'yoUSD Savings',
      asset: 'yoUSD',
      apy: snapUSD?.apyFormatted ?? '...',
      rewardApy: snapUSD?.rewardApy != null ? `${snapUSD.rewardApy.toFixed(2)}%` : '...',
      totalApy: apyUSD ?? '...',
      risk: 'Low',
      status: 'Active',
      accent: '#F59E0B',
      tvl: snapUSD?.tvlUsd,
      minDeposit: '1 USDC',
    },
    {
      name: 'yoETH Growth',
      asset: 'yoETH',
      apy: snapETH?.apyFormatted ?? '...',
      rewardApy: snapETH?.rewardApy != null ? `${snapETH.rewardApy.toFixed(2)}%` : '...',
      totalApy: apyETH ?? '...',
      risk: 'Med',
      status: 'Active',
      accent: '#3B82F6',
      tvl: snapETH?.tvlUsd,
      minDeposit: '0.001 WETH',
    },
    {
      name: 'yoBTC Reserve',
      asset: 'yoBTC',
      apy: snapBTC?.apyFormatted ?? '...',
      rewardApy: snapBTC?.rewardApy != null ? `${snapBTC.rewardApy.toFixed(2)}%` : '...',
      totalApy: apyBTC ?? '...',
      risk: 'Low',
      status: 'Active',
      accent: '#22C55E',
      tvl: snapBTC?.tvlUsd,
      minDeposit: '0.0001 cbBTC',
    },
    {
      name: 'yoEUR Reserve',
      asset: 'yoEUR',
      apy: snapEUR?.apyFormatted ?? '...',
      rewardApy: snapEUR?.rewardApy != null ? `${snapEUR.rewardApy.toFixed(2)}%` : '...',
      totalApy: apyEUR ?? '...',
      risk: 'Low',
      status: 'Active',
      accent: '#8B5CF6',
      tvl: snapEUR?.tvlUsd,
      minDeposit: '1 EURC',
    },
  ]

  return (
    <main className="min-h-screen bg-bg-page text-text-primary">
      <LandingNavbar />
      <HeroSection
        totalTvl={totalTvlFormatted}
        heroApy={bestTotalApy != null ? `Up to ${bestTotalApy.toFixed(2)}%` : undefined}
        heroRewardApy={bestRewardApy}
      />
      <StatsStrip realTvl={totalTvlFormatted} avgApy={avgApy} avgTotalApy={avgTotalApy} />
      <OpportunitySection />
      <FeaturesSection />
      <VaultSection vaults={liveVaults} />
      <BenchmarkSection yoTotalApy={snapUSD?.totalApy} />
      <FinalCTA />
      <Footer />
    </main>
  )
}
