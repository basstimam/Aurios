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

function RiskCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-5 shadow-card">
      <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-1.5">{title}</p>
      <p className="font-inter text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function SdkMethod({ method, description }: { method: string; description: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border-subtle last:border-b-0">
      <code className="font-roboto-mono text-sm" style={{ color: 'var(--accent-amber)' }}>
        {method}
      </code>
      <p className="font-inter text-text-secondary text-sm">{description}</p>
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
  {
    name: 'yoEUR',
    symbol: 'yoEUR',
    earning: 'Earns EUR yield on EURC deposits',
    accentVar: '#8B5CF6',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is my deposit safe?',
    a: 'Funds go directly to YO Protocol vaults on Base. Aurios never holds your assets. All interactions are non-custodial and verifiable on-chain.',
  },
  {
    q: 'How long does redemption take?',
    a: 'Usually instant. In rare cases where vault liquidity is temporarily constrained, redemptions can take up to 48 hours.',
  },
  {
    q: 'Are there any fees?',
    a: 'No fees from Aurios. Standard Base network gas fees apply for deposit and redemption transactions.',
  },
  {
    q: 'What wallet do I need?',
    a: 'Any EVM wallet (MetaMask, Coinbase Wallet, etc.) works via our Privy integration. You can also sign in with email or social accounts.',
  },
  {
    q: 'What chain does Aurios run on?',
    a: 'All transactions happen on Base mainnet, an Ethereum Layer 2. Base provides low gas fees and fast confirmations while inheriting Ethereum security.',
  },
  {
    q: 'Can I use Aurios for my DAO treasury?',
    a: 'Yes. Aurios is designed for team and DAO treasury management. Multiple signers can manage deposits across vaults with full on-chain transparency.',
  },
  {
    q: 'What are Merkl rewards?',
    a: 'Merkl rewards are additional yield incentives distributed by the Merkl protocol on top of base vault yield. They are claimable separately and tracked in your dashboard.',
  },
  {
    q: 'Is there a minimum deposit?',
    a: 'No minimum deposit amount. However, Base network gas fees apply to each transaction, so very small deposits may not be cost-effective.',
  },
  {
    q: 'How is yield generated?',
    a: 'Each vault deploys a specific strategy through YO Protocol. Strategies vary by vault and may include lending, staking, or liquidity provision. APY fluctuates based on market conditions.',
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
            A complete guide to depositing, earning yield, and managing your assets with Aurios.
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
              Aurios is a non-custodial savings interface built on YO Protocol. Connect your wallet,
              choose a vault, and your funds earn yield automatically on the Base network.
            </p>
            <p className="font-inter text-text-secondary text-sm leading-relaxed mt-3">
              There are no lock-ups and no minimums. You can withdraw anytime. Aurios never
              holds your funds — everything goes directly to audited YO Protocol vaults on-chain.
              All positions, performance, and pending redemptions are tracked in real time through
              your dashboard.
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
                <Step number={2} text="Choose a vault: yoUSD, yoETH, yoBTC, or yoEUR." />
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
            subtitle="Four vaults, each earning yield on a different asset class."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        {/* ── Section 5: Rewards & Merkl Incentives ──────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Rewards & Merkl Incentives"
            subtitle="Dua lapisan yield yang bisa kamu dapatkan dari setiap vault."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mb-8">

            {/* Vault Yield */}
            <div className="bg-bg-card border border-border-default rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--accent-amber)' }} />
                <p className="font-space-grotesk text-text-primary font-semibold">Vault Yield (Base APY)</p>
              </div>
              <p className="font-inter text-text-secondary text-sm leading-relaxed">
                Yield utama yang dihasilkan strategi vault YO Protocol — bisa berasal dari lending,
                staking, atau penyediaan likuiditas tergantung vault. Yield ini otomatis di-compound
                ke dalam harga share vault setiap waktu, sehingga posisimu tumbuh pasif tanpa perlu
                tindakan manual. Nilainya bisa dilihat real-time di dashboard.
              </p>
            </div>

            {/* Merkl Rewards */}
            <div className="bg-bg-card border border-border-default rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--accent-green)' }} />
                <p className="font-space-grotesk text-text-primary font-semibold">Merkl Rewards (Incentive)</p>
              </div>
              <p className="font-inter text-text-secondary text-sm leading-relaxed">
                Insentif token tambahan yang didistribusikan oleh{' '}
                <a
                  href="https://merkl.angle.money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-amber hover:underline"
                >
                  Merkl Protocol
                </a>
                {' '}kepada depositor vault YO. Tidak otomatis — harus di-claim secara manual dari
                halaman Rewards setiap kali ada saldo claimable. Transaksi claim dilakukan on-chain
                di Base Mainnet.
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-bg-card border border-border-default rounded-xl shadow-card max-w-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-0 border-b border-border-subtle">
              <div className="px-5 py-3">
                <p className="font-space-grotesk text-text-tertiary text-xs font-semibold uppercase tracking-wider">Aspek</p>
              </div>
              <div className="px-5 py-3 border-l border-border-subtle">
                <p className="font-space-grotesk text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-amber)' }}>Vault Yield</p>
              </div>
              <div className="px-5 py-3 border-l border-border-subtle">
                <p className="font-space-grotesk text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>Merkl Rewards</p>
              </div>
            </div>
            {[
              ['Sumber', 'Strategi YO Protocol', 'Merkl Protocol (insentif)'],
              ['Proses', 'Otomatis di-compound', 'Harus di-claim manual'],
              ['Lihat di', 'Dashboard → posisi aktif', 'Halaman Rewards'],
              ['Frekuensi', 'Terus-menerus (real-time)', 'Periodik per epoch Merkl'],
              ['On-chain tx', 'Tidak diperlukan', 'Diperlukan saat claim'],
            ].map(([aspek, vault, merkl]) => (
              <div key={aspek} className="grid grid-cols-3 gap-0 border-b border-border-subtle last:border-b-0">
                <div className="px-5 py-3.5">
                  <p className="font-inter text-text-secondary text-sm">{aspek}</p>
                </div>
                <div className="px-5 py-3.5 border-l border-border-subtle">
                  <p className="font-inter text-text-primary text-sm">{vault}</p>
                </div>
                <div className="px-5 py-3.5 border-l border-border-subtle">
                  <p className="font-inter text-text-primary text-sm">{merkl}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 5: Security and Risk ─────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Security and Risk"
            subtitle="Transparency about how your funds are handled and what risks exist."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
            <RiskCard
              title="Non-Custodial Architecture"
              description="Aurios never holds your funds. Every deposit and redemption is a direct on-chain transaction with YO Protocol vaults. Your wallet retains full control at all times."
            />
            <RiskCard
              title="Smart Contract Risk"
              description="YO Protocol vaults are audited, but smart contract risk is inherent to all DeFi protocols. Only deposit what you can afford to lose."
            />
            <RiskCard
              title="Yield Fluctuation"
              description="APY is variable and fluctuates based on market conditions, utilization rates, and protocol incentives. Past performance does not guarantee future returns."
            />
            <RiskCard
              title="Redemption Timing"
              description="Redemptions are usually instant. In edge cases where vault liquidity is temporarily constrained, withdrawals can take up to 48 hours to process."
            />
            <RiskCard
              title="Base Network (L2)"
              description="All transactions execute on Base mainnet, an Ethereum Layer 2. Base inherits Ethereum's security while providing lower gas fees and faster confirmations."
            />
          </div>
        </motion.section>

        {/* ── Section 6: Built on YO Protocol ──────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <SectionHeader
            title="Built on YO Protocol"
            subtitle="All on-chain interactions use the @yo-protocol/core SDK."
          />
          <div className="bg-bg-card border border-border-default rounded-xl shadow-card max-w-2xl">

            {/* Deposit Flow */}
            <div className="p-6 border-b border-border-subtle">
              <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-3">
                Deposit Flow
              </p>
              <SdkMethod
                method="yo.deposit()"
                description="Executes an on-chain deposit into the selected vault. Returns a transaction hash for confirmation."
              />
            </div>

            {/* Redeem Flow */}
            <div className="p-6 border-b border-border-subtle">
              <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-3">
                Redeem Flow
              </p>
              <SdkMethod
                method="yo.redeem()"
                description="Initiates a share redemption from the vault."
              />
              <SdkMethod
                method="yo.waitForRedeemReceipt()"
                description="Polls for redemption completion and returns the final receipt."
              />
            </div>

            {/* Real-Time Data */}
            <div className="p-6 border-b border-border-subtle">
              <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-3">
                Real-Time Data
              </p>
              <SdkMethod
                method="yo.getUserPosition()"
                description="Returns current vault shares, deposited value, and unrealized gains."
              />
              <SdkMethod
                method="yo.getUserPerformance()"
                description="Returns historical performance metrics including total yield earned."
              />
              <SdkMethod
                method="yo.getVaultSnapshot()"
                description="Returns current vault state: TVL, share price, and APY."
              />
            </div>

            {/* Additional Integrations */}
            <div className="p-6">
              <p className="font-space-grotesk text-text-primary font-semibold text-sm mb-3">
                Additional Integrations
              </p>
              <SdkMethod
                method="yo.getClaimableRewards()"
                description="Fetches claimable Merkl rewards for the connected wallet."
              />
              <SdkMethod
                method="yo.getPendingRedemptions()"
                description="Lists all in-progress redemptions and their expected completion time."
              />
              <SdkMethod
                method="yo.getUserHistory()"
                description="Returns the full transaction history for deposits, redemptions, and reward claims."
              />
            </div>

          </div>
        </motion.section>

        {/* ── Section 7: FAQ ───────────────────────────────────────────────────── */}
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
