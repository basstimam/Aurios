'use client'

import { motion, Variants, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ── SVG Icons ──────────────────────────────────────────────────────── */
function HexLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
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

/* ── Count-Up Hook ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { count, ref }
}

/* ── LandingNavbar ──────────────────────────────────────────────────── */
function LandingNavbar() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-border-subtle bg-bg-page"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-accent-amber">
          <HexLogo size={22} />
          <span className="font-space-grotesk text-lg font-bold text-text-primary tracking-tight">
            Smelt
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Vaults', href: '#vaults' },
            { label: 'Docs', href: '#' },
          ].map((link) => (
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

        <Link
          href="/dashboard"
          className="rounded-lg px-4 py-2 font-space-grotesk text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
        >
          Launch App
        </Link>
      </nav>
    </motion.header>
  )
}

/* ── HeroSection ────────────────────────────────────────────────────── */
function HeroSection() {
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
          Smart Savings for
          <br />
          DAO Treasuries
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-inter text-base leading-relaxed text-text-secondary max-w-md"
        >
          Smelt is the institutional-grade savings layer for onchain organizations.
          Deploy treasury funds into audited YO Protocol vaults. Earn real yield.
          Stay in control.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="rounded-lg px-6 py-3 font-space-grotesk text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
          >
            Start Saving
          </Link>
          <a
            href="#vaults"
            className="rounded-lg border border-border-default px-6 py-3 font-space-grotesk text-sm font-semibold text-text-primary hover:border-accent-amber hover:text-accent-amber transition-colors"
          >
            View Vaults
          </a>
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

      {/* Right — floating card */}
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
              Treasury Dashboard
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 font-roboto-mono text-xs font-medium"
              style={{ backgroundColor: 'rgba(22,163,74,0.12)', color: 'var(--accent-green)' }}
            >
              Active
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="font-space-grotesk text-lg font-bold text-text-primary">yoUSD Vault</p>
              <span className="font-roboto-mono text-xl font-medium text-accent-amber">
                +12.4%
              </span>
            </div>
            <p className="font-inter text-xs text-text-tertiary mt-0.5">APY</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-2 w-full rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: '62%', backgroundColor: 'var(--accent-amber)' }}
              />
            </div>
            <div className="flex justify-between font-roboto-mono text-xs text-text-tertiary">
              <span>$124,000</span>
              <span>$200,000 target</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-subtle pt-4 font-inter text-xs text-text-secondary">
            <span>Status: Active</span>
            <span className="text-border-strong">|</span>
            <span>Risk: Low</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── StatsStrip ─────────────────────────────────────────────────────── */
interface StatItemProps {
  target: number
  prefix?: string
  suffix?: string
  decimals?: number
  divisor?: number
  label: string
  hasBorder?: boolean
}

function StatItem({
  target,
  prefix = '',
  suffix = '',
  decimals = 0,
  divisor = 1,
  label,
  hasBorder = false,
}: StatItemProps) {
  const { count, ref } = useCountUp(target)
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-1.5 py-2 ${hasBorder ? 'border-l border-border-subtle' : ''}`}
    >
      <span className="font-mono-number text-3xl font-medium text-text-primary">
        {prefix}
        {(count / divisor).toFixed(decimals)}
        {suffix}
      </span>
      <span className="font-inter text-sm text-text-secondary text-center">{label}</span>
    </div>
  )
}

function StatsStrip() {
  const stats: Array<Omit<StatItemProps, 'hasBorder'>> = [
    { target: 24, prefix: '$', suffix: 'B+', decimals: 1, divisor: 10, label: 'TVL Across YO Vaults' },
    { target: 147, suffix: '%', decimals: 1, divisor: 10, label: 'Average APY' },
    { target: 3, label: 'Supported Assets' },
    { target: 999, suffix: '%', decimals: 1, divisor: 10, label: 'Uptime' },
  ]

  return (
    <section className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} hasBorder={i > 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── OpportunitySection ─────────────────────────────────────────────── */
function OpportunitySection() {
  const benefits = [
    {
      icon: <BuildingIcon />,
      title: 'Treasury Efficiency',
      desc: 'Stop letting DAO funds sit idle. Put your treasury to work with institutional-grade yield.',
    },
    {
      icon: <ZapIcon />,
      title: 'Instant Deployment',
      desc: 'One transaction to deploy. No complex multisig setup. No waiting periods.',
    },
    {
      icon: <BarChartIcon />,
      title: 'Real Yield',
      desc: 'Not tokenomics games. Real protocol revenue distributed to depositors.',
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
        {/* Left */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col gap-6"
        >
          <motion.p
            variants={fadeUp}
            className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber"
          >
            The Opportunity
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-space-grotesk text-3xl font-bold leading-tight text-text-primary md:text-4xl"
          >
            Why DAOs choose Smelt
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-inter text-base leading-relaxed text-text-secondary"
          >
            Most DAO treasuries sit idle in multisigs, earning nothing while inflation
            erodes purchasing power. Smelt connects your treasury to optimized YO
            Protocol vaults — with the controls your governance requires.
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="font-inter text-base leading-relaxed text-text-secondary"
          >
            From stablecoin yield to crypto-native growth strategies, choose the risk
            profile that fits your DAO&apos;s mandate.
          </motion.p>
        </motion.div>

        {/* Right */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col gap-4"
        >
          {benefits.map((b) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              className="rounded-xl border border-border-subtle bg-bg-card p-5 flex items-start gap-4"
            >
              <span className="mt-0.5 flex-shrink-0 text-accent-amber">{b.icon}</span>
              <div>
                <p className="font-space-grotesk text-sm font-semibold text-text-primary">
                  {b.title}
                </p>
                <p className="font-inter text-sm leading-relaxed text-text-secondary mt-1">
                  {b.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── FeaturesSection ────────────────────────────────────────────────── */
function FeaturesSection() {
  const features = [
    {
      icon: <LockIcon />,
      title: 'Non-Custodial',
      desc: 'Your keys, your assets. Smelt never holds funds directly.',
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
function VaultSection() {
  const vaults = [
    { name: 'yoUSD Savings', asset: 'yoUSD', apy: '12.4%', risk: 'Low', status: 'Active' },
    { name: 'yoETH Growth', asset: 'yoETH', apy: '18.2%', risk: 'Med', status: 'Active' },
    { name: 'yoBTC Reserve', asset: 'yoBTC', apy: '9.8%', risk: 'Low', status: 'Active' },
  ]

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
          Available Vaults
        </motion.h2>

        <motion.div variants={stagger} className="flex flex-col gap-3">
          {vaults.map((v) => (
            <motion.div
              key={v.name}
              variants={fadeLeft}
              className="rounded-xl border border-border-subtle bg-bg-card overflow-hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-0.5 sm:w-44">
                  <span className="font-space-grotesk text-sm font-semibold text-text-primary">
                    {v.name}
                  </span>
                  <span className="font-roboto-mono text-xs text-text-tertiary">{v.asset}</span>
                </div>

                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-xs text-text-tertiary">APY</span>
                    <span className="font-roboto-mono text-lg font-medium text-accent-amber">
                      {v.apy}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-xs text-text-tertiary">Risk</span>
                    <span
                      className="rounded px-2 py-0.5 font-inter text-xs font-medium"
                      style={{
                        backgroundColor:
                          v.risk === 'Low' ? 'rgba(22,163,74,0.1)' : 'rgba(245,158,11,0.1)',
                        color: v.risk === 'Low' ? 'var(--accent-green)' : 'var(--accent-amber)',
                      }}
                    >
                      {v.risk}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-xs text-text-tertiary">Status</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-inter text-xs"
                      style={{
                        backgroundColor: 'rgba(22,163,74,0.1)',
                        color: 'var(--accent-green)',
                      }}
                    >
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
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
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
            Join DAOs already earning real yield with Smelt. One transaction to deploy.
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
          <div className="flex items-center gap-2 text-accent-amber">
            <HexLogo size={20} />
            <span className="font-space-grotesk text-base font-bold text-text-primary">
              Smelt
            </span>
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
              { label: 'Docs', href: '#' },
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
            &copy; 2026 Smelt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-page text-text-primary">
      <LandingNavbar />
      <HeroSection />
      <StatsStrip />
      <OpportunitySection />
      <FeaturesSection />
      <VaultSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
