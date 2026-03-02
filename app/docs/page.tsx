'use client'

import { motion, type Variants } from 'framer-motion'
import { AppLayout } from '@/components'
import { VaultIcon } from '@/components/VaultIcon'

// ── Animation Variants ────────────────────────────────────────────────────────

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-space-grotesk text-text-primary text-xl font-bold">{title}</h2>
      {subtitle && (
        <p className="font-inter text-text-secondary text-sm mt-1">{subtitle}</p>
      )}
    </div>
  )
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-space-grotesk flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-amber)', color: 'var(--bg-card)' }}
        >
          {number}
        </div>
        <div
          className="w-px flex-1 min-h-[16px] my-1"
          style={{ backgroundColor: 'var(--border-default)' }}
        />
      </div>
      <div className="pb-4">
        <p className="font-inter text-text-primary text-sm leading-snug">{text}</p>
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border-subtle last:border-b-0 py-5">
      <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-1.5">{q}</p>
      <p className="font-inter text-text-secondary text-sm leading-relaxed">{a}</p>
    </div>
  )
}

// ── Vault display data ────────────────────────────────────────────────────────

const VAULTS_INFO = [
  {
    name: 'yoUSD',
    symbol: 'yoUSD',
    earning: 'Earns yield on USDC deposits',
    accentVar: 'var(--accent-amber)',
  },
  {
    name: 'yoETH',
    symbol: 'yoETH',
    earning: 'Earns ETH staking yield on WETH deposits',
    accentVar: 'var(--accent-blue)',
  },
  {
    name: 'yoBTC',
    symbol: 'yoBTC',
    earning: 'Earns BTC yield on cbBTC deposits',
    accentVar: 'var(--accent-green)',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is my deposit safe?',
    a: 'Funds go directly to YO Protocol vaults on Base. Aurios never holds your assets.',
  },
  {
    q: 'How long does redemption take?',
    a: 'Usually instant. In rare cases, up to 48 hours.',
  },
  {
    q: 'Are there any fees?',
    a: 'No fees from Aurios. Standard Base network gas fees apply.',
  },
  {
    q: 'What wallet do I need?',
    a: 'Any EVM wallet (MetaMask, Coinbase Wallet, etc.) works via our Privy integration.',
  },
]

// ── DocsPage ──────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1280px] mx-auto px-4 sm:px-10 py-10 space-y-16"
      >

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="font-space-grotesk text-text-primary text-3xl sm:text-4xl font-bold mb-3">
            How It Works
          </h1>
          <p className="font-inter text-text-secondary text-base max-w-2xl">
            A simple guide to saving and earning yield with Aurios.
          </p>
        </motion.section>

        {/* ── Section 1: What is Aurios ───────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader title="What is Aurios" />
          <div className="bg-bg-card border border-border-default rounded-xl p-6 shadow-card max-w-2xl">
            <p className="font-inter text-text-primary text-sm leading-relaxed">
              Aurios is a savings interface built on YO Protocol. Connect your wallet, choose a
              vault, and your funds earn yield automatically on the Base network.
            </p>
            <p className="font-inter text-text-secondary text-sm leading-relaxed mt-3">
              There are no lock-ups and no minimums. You can withdraw anytime. Aurios never
              holds your funds. Everything goes directly to YO Protocol vaults on-chain.
            </p>
          </div>
        </motion.section>

        {/* ── Section 2 & 3: Deposit + Redeem ─────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Deposit */}
            <div className="bg-bg-card border border-border-default rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--accent-amber)' }} />
                <h2 className="font-space-grotesk text-text-primary font-bold text-lg">How to Deposit</h2>
              </div>
              <div>
                <Step number={1} text="Connect your EVM wallet." />
                <Step number={2} text="Choose a vault: yoUSD, yoETH, or yoBTC." />
                <Step number={3} text="Enter the amount you want to deposit." />
                <Step number={4} text="Review the preview and confirm the transaction." />
                <div className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-space-grotesk flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--accent-amber)', color: 'var(--bg-card)' }}
                  >
                    5
                  </div>
                  <p className="font-inter text-text-primary text-sm leading-snug">
                    Done. Your funds start earning immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Redeem */}
            <div className="bg-bg-card border border-border-default rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--accent-blue)' }} />
                <h2 className="font-space-grotesk text-text-primary font-bold text-lg">How to Redeem</h2>
              </div>
              <div>
                <Step number={1} text="Go to the Redeem page." />
                <Step number={2} text="Select the vault you want to withdraw from." />
                <Step number={3} text="Enter the amount of shares to redeem." />
                <div className="flex gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-space-grotesk flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--accent-blue)', color: 'var(--bg-card)' }}
                  >
                    4
                  </div>
                  <p className="font-inter text-text-primary text-sm leading-snug">
                    Confirm the transaction. Funds return to your wallet, usually instant,
                    occasionally queued up to 48 hours.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </motion.section>

        {/* ── Section 4: Vaults ────────────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Available Vaults"
            subtitle="Three vaults, each earning yield on a different asset."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VAULTS_INFO.map((vault) => (
              <div
                key={vault.name}
                className="bg-bg-card rounded-xl p-5 shadow-card border"
                style={{ borderColor: vault.accentVar }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <VaultIcon symbol={vault.symbol} size={36} />
                  <p
                    className="font-space-grotesk font-bold"
                    style={{ color: vault.accentVar }}
                  >
                    {vault.name}
                  </p>
                </div>
                <p className="font-inter text-text-secondary text-sm">{vault.earning}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 5: FAQ ───────────────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader title="Frequently Asked Questions" />
          <div className="bg-bg-card border border-border-default rounded-xl px-6 shadow-card max-w-2xl">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </motion.section>

        {/* ── Footer ───────────────────────────────────────────────────────────── */}
        <footer className="border-t border-border-subtle pt-8 text-center">
          <p className="font-inter text-sm text-text-tertiary">
            Powered by{' '}
            <span className="font-medium" style={{ color: 'var(--accent-amber)' }}>
              YO Protocol
            </span>
          </p>
        </footer>

      </motion.div>
    </AppLayout>
  )
}
