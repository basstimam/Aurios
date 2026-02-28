'use client'

import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, VaultCard } from '@/components'
import { useVaultData } from '@/hooks/useVaultData'
import { useUserPosition } from '@/hooks/useUserPosition'
import { useTransactions } from '@/hooks/useTransactions'
import { VAULTS, VAULT_LIST, VaultConfig } from '@/lib/contracts/vaults'

// ── Animation Variants ────────────────────────────────────────────────────────

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.07 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const VAULT_APY: Record<string, string> = {
  yoUSD: '8.4%',
  yoETH: '5.2%',
  yoBTC: '3.8%',
}

function fmtAssets(assets: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(assets, decimals))
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M ${symbol}`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K ${symbol}`
  const precision = 2
  return `${val.toLocaleString('en-US', { maximumFractionDigits: precision })} ${symbol}`
}

// ── StatCard ──────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="bg-bg-card border border-border-default rounded-xl p-6"
    >
      <p className="text-text-secondary text-sm font-inter mb-2">{title}</p>
      <p className="font-roboto-mono text-text-primary text-3xl font-bold mb-1">{value}</p>
      <p className="text-text-tertiary text-xs font-inter">{subtitle}</p>
    </motion.div>
  )
}

// ── VaultCardWrapper ──────────────────────────────────────────────────────────

function VaultCardWrapper({
  vault,
  onClick,
}: {
  vault: VaultConfig
  onClick: () => void
}) {
  const { data } = useVaultData(vault.address)

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
      <VaultCard
        name={vault.name}
        assetSymbol={vault.assetSymbol}
        description={vault.description}
        color={vault.color}
        apy={VAULT_APY[vault.name] ?? '—'}
        tvl={
          data?.totalAssets != null
            ? fmtAssets(data.totalAssets, vault.decimals, vault.assetSymbol)
            : undefined
        }
        onClick={onClick}
      />
    </motion.div>
  )
}

// ── PortfolioStats ────────────────────────────────────────────────────────────

function PortfolioStats() {
  const { isConnected } = useAccount()

  const { data: posUSD } = useUserPosition(VAULTS.yoUSD.address)
  const { data: posETH } = useUserPosition(VAULTS.yoETH.address)
  const { data: posBTC } = useUserPosition(VAULTS.yoBTC.address)

  if (!isConnected) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <StatCard title="Total Balance" value="—" subtitle="Connect wallet to view" />
        <StatCard title="Total Yield Earned" value="—" subtitle="Connect wallet to view" />
        <StatCard title="Active Positions" value="—" subtitle="Connect wallet to view" />
      </motion.div>
    )
  }

  const activeCount = [posUSD, posETH, posBTC].filter(
    (p) => p != null && p.shares > BigInt(0)
  ).length

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
    >
      <StatCard
        title="Total Balance"
        value="—"
        subtitle="Multi-asset portfolio"
      />
      <StatCard
        title="Total Yield Earned"
        value="—"
        subtitle="Yield tracking coming soon"
      />
      <StatCard
        title="Active Positions"
        value={String(activeCount)}
        subtitle="Vaults with deposits"
      />
    </motion.div>
  )
}

// ── PositionsTable ────────────────────────────────────────────────────────────

function PositionsTable() {
  const router = useRouter()
  const { isConnected } = useAccount()

  const { data: posUSD } = useUserPosition(VAULTS.yoUSD.address)
  const { data: posETH } = useUserPosition(VAULTS.yoETH.address)
  const { data: posBTC } = useUserPosition(VAULTS.yoBTC.address)

  const { data: dataUSD } = useVaultData(VAULTS.yoUSD.address)
  const { data: dataETH } = useVaultData(VAULTS.yoETH.address)
  const { data: dataBTC } = useVaultData(VAULTS.yoBTC.address)

  if (!isConnected) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-bg-card border border-border-default rounded-xl p-5"
      >
        <p className="text-text-tertiary text-center py-12 font-inter">
          Connect your wallet to view your active positions
        </p>
      </motion.div>
    )
  }

  const allRows = [
    { vault: VAULTS.yoUSD, position: posUSD, vaultData: dataUSD },
    { vault: VAULTS.yoETH, position: posETH, vaultData: dataETH },
    { vault: VAULTS.yoBTC, position: posBTC, vaultData: dataBTC },
  ]

  const activeRows = allRows.filter(
    (r): r is typeof r & { position: { shares: bigint; assets: bigint } } =>
      r.position != null && r.position.shares > BigInt(0)
  )

  if (activeRows.length === 0) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="bg-bg-card border border-border-default rounded-xl p-5"
      >
        <p className="text-text-tertiary text-center py-12 font-inter">
          No active positions yet.{' '}
          <button
            onClick={() => router.push('/deposit/choose')}
            className="text-accent-amber underline hover:no-underline transition-all"
          >
            Deposit into a vault
          </button>{' '}
          to start earning yield.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-subtle">
            {['Vault', 'Deposited', 'Current Value', 'Yield', 'APY', 'Actions'].map((col) => (
              <th
                key={col}
                className="text-text-secondary text-sm font-inter font-normal text-left px-6 py-4 first:pl-5"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody variants={stagger} initial="hidden" animate="visible">
          {activeRows.map(({ vault, position }) => {
            const depositedStr = fmtAssets(position.assets, vault.decimals, vault.assetSymbol)
            const apyStr = VAULT_APY[vault.name] ?? '—'

            return (
              <motion.tr
                key={vault.address}
                variants={fadeUp}
                className="border-b border-border-subtle last:border-b-0 hover:bg-bg-card-hover transition-colors"
              >
                {/* Vault */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-space-grotesk"
                      style={{
                        backgroundColor: `${vault.color}22`,
                        color: vault.color,
                      }}
                    >
                      {vault.assetSymbol[0]}
                    </div>
                    <div>
                      <p className="font-space-grotesk text-sm font-semibold text-text-primary">
                        {vault.name}
                      </p>
                      <p className="font-inter text-xs text-text-secondary">
                        {vault.assetSymbol}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Deposited */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-text-primary">
                    {depositedStr}
                  </span>
                </td>

                {/* Current Value */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-text-primary">
                    {depositedStr}
                  </span>
                </td>

                {/* Yield */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-text-secondary">—</span>
                </td>

                {/* APY */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-accent-amber">
                    {apyStr}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => router.push('/deposit/choose')}
                      className="bg-accent-amber text-black font-semibold px-4 py-2 rounded-lg hover:bg-accent-amber-dark text-sm transition-colors"
                    >
                      Deposit
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="border border-border-default text-text-secondary px-4 py-2 rounded-lg hover:border-accent-amber hover:text-accent-amber text-sm transition-colors"
                    >
                      Withdraw
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            )
          })}
        </motion.tbody>
      </table>
    </div>
  )
}

// ── TxHistorySection ────────────────────────────────────────────────────────────────────────

function TxHistorySection() {
  const { isConnected } = useAccount()
  const { data: txs = [], isLoading } = useTransactions(10)

  if (!isConnected) return null

  return (
    <section>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="font-space-grotesk text-text-primary text-xl font-bold mb-4"
      >
        Transaction History
      </motion.h2>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="px-5 py-10 text-center font-inter text-text-tertiary text-sm">Loading transactions…</div>
        ) : txs.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-inter text-text-tertiary text-sm">No transactions yet</p>
            <p className="font-inter text-text-tertiary text-xs mt-1">Your deposits and redeems will appear here</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Action</th>
                <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Vault</th>
                <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Tx Hash</th>
                <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <motion.tbody variants={stagger} initial="hidden" animate="visible">
              {txs.map((tx) => (
                <motion.tr
                  key={tx.id}
                  variants={fadeUp}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tx.action === 'deposit' ? 'bg-accent-amber' : 'bg-blue-400'}`} />
                      <span className="font-inter text-sm text-text-primary capitalize">{tx.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-space-grotesk text-sm text-text-primary font-semibold">{tx.vault_name}</td>
                  <td className="px-5 py-4 font-roboto-mono text-sm text-text-primary">{tx.amount_display}</td>
                  <td className="px-5 py-4">
                    {tx.tx_hash ? (
                      <a
                        href={`https://basescan.org/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-roboto-mono text-xs text-accent-amber hover:underline"
                      >
                        {tx.tx_hash.slice(0, 8)}…
                      </a>
                    ) : (
                      <span className="font-roboto-mono text-xs text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-text-tertiary text-xs font-inter">
                    {(() => {
                      const diff = Date.now() - new Date(tx.created_at).getTime()
                      const m = Math.floor(diff / 60000)
                      if (m < 1) return 'just now'
                      if (m < 60) return `${m}m ago`
                      const h = Math.floor(m / 60)
                      if (h < 24) return `${h}h ago`
                      return `${Math.floor(h / 24)}d ago`
                    })()
                  }</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </motion.div>
    </section>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1280px] mx-auto px-10 py-10 space-y-10"
      >

        {/* ── Portfolio Summary ─────────────────────────────────────────────── */}
        <section>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-space-grotesk text-text-primary text-xl font-bold mb-6"
          >
            Portfolio Summary
          </motion.h2>
          <PortfolioStats />
        </section>

        {/* ── Available Vaults ──────────────────────────────────────────────── */}
        <section>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-space-grotesk text-text-primary text-xl font-bold mb-4"
          >
            Available Vaults
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {VAULT_LIST.map((vault) => (
              <VaultCardWrapper
                key={vault.address}
                vault={vault}
                onClick={() => router.push('/deposit/choose')}
              />
            ))}
            <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
              <VaultCard
                name="More Coming Soon"
                assetSymbol="—"
                description="New yield opportunities being added"
                color="#6B625A"
                isDisabled
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Active Positions ──────────────────────────────────────────────── */}
        <section>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="font-space-grotesk text-text-primary text-xl font-bold mb-4"
          >
            Active Positions
          </motion.h2>
          <PositionsTable />
        </section>

        {/* ── Transaction History ──────────────────────────────────────────────────── */}
        <TxHistorySection />

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-border-subtle pt-8 text-center">
          <p className="font-inter text-sm text-text-tertiary">
            Powered by{' '}
            <span className="text-accent-amber font-medium">YO Protocol</span>
          </p>
        </footer>

      </motion.div>
    </AppLayout>
  )
}
