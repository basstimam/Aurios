'use client'

import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, VaultCard, VaultIcon } from '@/components'
import { useVaultData } from '@/hooks/useVaultData'
import { useUserPosition } from '@/hooks/useUserPosition'
import { useTransactions } from '@/hooks/useTransactions'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { useUserPerformance } from '@/hooks/useUserPerformance'
import { usePendingRedemptions } from '@/hooks/usePendingRedemptions'
import { useUserHistory } from '@/hooks/useUserHistory'
import { useMerklRewards, useClaimMerklRewards, getClaimableTokens, formatTokenAmount } from '@/hooks/useMerklRewards'
import { YieldChart } from '@/components/YieldChart'
import { TvlChart } from '@/components/TvlChart'
import { VAULTS, VAULT_LIST, VaultConfig } from '@/lib/contracts/vaults'
import type { SdkHistoryEntry } from '@/hooks/useUserHistory'
import type { Transaction } from '@/lib/supabase'

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

function fmtAssets(assets: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(assets, decimals))
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M ${symbol}`
  if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K ${symbol}`
  const precision = decimals === 8 ? 6 : 4
  return `${val.toLocaleString('en-US', { maximumFractionDigits: precision })} ${symbol}`
}

function fmtShares(shares: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(shares, decimals))
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M ${symbol}`
  if (val >= 1_000) return `${(val / 1_000).toFixed(2)}K ${symbol}`
  const precision = decimals === 8 ? 6 : 4
  return `${val.toLocaleString('en-US', { maximumFractionDigits: precision })} ${symbol}`
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
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
      className="relative bg-bg-card border border-border-default rounded-xl p-6 overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
    >
      {/* Amber accent left bar */}
      <div className="absolute left-0 inset-y-0 w-0.5 rounded-l-xl" style={{ backgroundColor: 'var(--accent-amber)' }} />
      <p className="text-text-secondary text-xs font-inter uppercase tracking-wider mb-3">{title}</p>
      <p className="font-roboto-mono text-text-primary text-3xl font-bold mb-1.5">{value}</p>
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
  const { data: snapshot } = useVaultSnapshot(vault.address)

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
      <VaultCard
        name={vault.name}
        assetSymbol={vault.assetSymbol}
        description={vault.description}
        color={vault.color}
        apy={snapshot?.totalApyFormatted ?? '...'}
        nativeApy={snapshot?.apyFormatted}
        rewardApy={snapshot?.rewardApy ?? undefined}
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
  const { data: posEUR } = useUserPosition(VAULTS.yoEUR.address)
  const { data: snapUSD } = useVaultSnapshot(VAULTS.yoUSD.address)
  const { data: snapETH } = useVaultSnapshot(VAULTS.yoETH.address)
  const { data: snapBTC } = useVaultSnapshot(VAULTS.yoBTC.address)
  const { data: snapEUR } = useVaultSnapshot(VAULTS.yoEUR.address)

  // Feature #1: getUserPerformance for all 3 vaults
  const { data: perfUSD } = useUserPerformance(VAULTS.yoUSD.address)
  const { data: perfETH } = useUserPerformance(VAULTS.yoETH.address)
  const { data: perfBTC } = useUserPerformance(VAULTS.yoBTC.address)
  const { data: perfEUR } = useUserPerformance(VAULTS.yoEUR.address)

  if (!isConnected) {
    return (
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <StatCard title="Total Balance" value="..." subtitle="Connect wallet to view" />
        <StatCard title="Total Yield Earned" value="..." subtitle="Connect wallet to view" />
        <StatCard title="Active Positions" value="..." subtitle="Connect wallet to view" />
      </motion.div>
    )
  }

  const activeCount = [posUSD, posETH, posBTC, posEUR].filter(
    (p) => p != null && p.shares > BigInt(0)
  ).length

  // Estimate annual yield per vault based on APY
  const apyRates: Record<string, number> = {
    yoUSD: (snapUSD?.totalApy ?? 0) / 100,
    yoETH: (snapETH?.totalApy ?? 0) / 100,
    yoBTC: (snapBTC?.totalApy ?? 0) / 100,
    yoEUR: (snapEUR?.totalApy ?? 0) / 100,
  }
  const positions = [
    { pos: posUSD, vault: VAULTS.yoUSD, key: 'yoUSD' },
    { pos: posETH, vault: VAULTS.yoETH, key: 'yoETH' },
    { pos: posBTC, vault: VAULTS.yoBTC, key: 'yoBTC' },
    { pos: posEUR, vault: VAULTS.yoEUR, key: 'yoEUR' },
  ]
  // Find primary non-zero position for display
  const primaryPos = positions.find((p) => p.pos != null && p.pos.shares > BigInt(0))

  let estYieldStr = '...'
  if (primaryPos && primaryPos.pos) {
    const assets = parseFloat(formatUnits(primaryPos.pos.assets, primaryPos.vault.decimals))
    const annualYield = assets * apyRates[primaryPos.key]
    estYieldStr = `${annualYield.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${primaryPos.vault.assetSymbol}/yr`
  }

  // Feature #1: Sum unrealized P&L across all 3 vaults
  const totalUnrealized =
    (perfUSD?.unrealized?.raw ?? 0) +
    (perfETH?.unrealized?.raw ?? 0) +
    (perfBTC?.unrealized?.raw ?? 0) +
    (perfEUR?.unrealized?.raw ?? 0)

  const unrealizedStr =
    activeCount === 0
      ? '...'
      : totalUnrealized !== 0
      ? totalUnrealized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : '...'

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
    >
      <StatCard
        title="Active Positions"
        value={String(activeCount)}
        subtitle={activeCount === 1 ? '1 vault with deposits' : `${activeCount} vaults with deposits`}
      />
      <StatCard
        title="Est. Annual Yield"
        value={estYieldStr}
        subtitle="Based on total APY (native + reward)"
      />
      <StatCard
        title="Unrealized P&L"
        value={unrealizedStr}
        subtitle="Across all vault positions"
      />
    </motion.div>
  )
}

// ── PendingRedemptionsSection ──────────────────────────────────────────────────

function PendingRedemptionsSection() {
  const { isConnected } = useAccount()

  // Feature #4: ALL hooks before early return
  const { data: pendingUSD } = usePendingRedemptions(VAULTS.yoUSD.address)
  const { data: pendingETH } = usePendingRedemptions(VAULTS.yoETH.address)
  const { data: pendingBTC } = usePendingRedemptions(VAULTS.yoBTC.address)

  if (!isConnected) return null

  const allPending = [
    { vault: VAULTS.yoUSD, data: pendingUSD },
    { vault: VAULTS.yoETH, data: pendingETH },
    { vault: VAULTS.yoBTC, data: pendingBTC },
  ].filter((p) => p.data != null && Number(p.data.shares?.raw ?? 0) > 0)

  if (allPending.length === 0) return null

  return (
    <motion.section variants={fadeUp} initial="hidden" animate="visible">
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-5"
        style={{ borderColor: 'rgba(245,158,11,0.4)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          {/* Pulsing amber indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-amber opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-amber" />
          </span>
          <h3 className="font-space-grotesk text-text-primary font-semibold">Pending Redemptions</h3>
          <span className="font-inter text-text-tertiary text-xs">Processing…</span>
        </div>

        <div className="space-y-3">
          {allPending.map(({ vault, data }) => (
            <div
              key={vault.address}
              className="flex items-center justify-between p-3 bg-bg-card-hover rounded-lg border border-border-subtle"
            >
              <div className="flex items-center gap-3">
                <VaultIcon symbol={vault.name} size={28} />
                <div>
                  <p className="font-space-grotesk text-text-primary text-sm font-semibold">
                    {vault.name}
                  </p>
                  <p className="font-inter text-text-tertiary text-xs">
                    {data?.shares?.formatted ?? '...'} shares queued
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-roboto-mono text-text-primary text-sm">
                  ~{data?.assets?.formatted ?? '...'} {vault.assetSymbol}
                </p>
                <p className="font-inter text-text-tertiary text-xs">estimated receive</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  )
}

// ── PositionsTable ────────────────────────────────────────────────────────────

function PositionsTable() {
  const router = useRouter()
  const { isConnected } = useAccount()

  const { data: posUSD } = useUserPosition(VAULTS.yoUSD.address)
  const { data: posETH } = useUserPosition(VAULTS.yoETH.address)
  const { data: posBTC } = useUserPosition(VAULTS.yoBTC.address)
  const { data: posEUR } = useUserPosition(VAULTS.yoEUR.address)

  const { data: dataUSD } = useVaultData(VAULTS.yoUSD.address)
  const { data: dataETH } = useVaultData(VAULTS.yoETH.address)
  const { data: dataBTC } = useVaultData(VAULTS.yoBTC.address)
  const { data: dataEUR } = useVaultData(VAULTS.yoEUR.address)

  const { data: snapUSD } = useVaultSnapshot(VAULTS.yoUSD.address)
  const { data: snapETH } = useVaultSnapshot(VAULTS.yoETH.address)
  const { data: snapBTC } = useVaultSnapshot(VAULTS.yoBTC.address)
  const { data: snapEUR } = useVaultSnapshot(VAULTS.yoEUR.address)
  const snapshots: Record<string, { apy: string; reward: string }> = {
    [VAULTS.yoUSD.address]: { apy: snapUSD?.totalApyFormatted ?? '...', reward: snapUSD?.rewardApy ? `+${snapUSD.rewardApy.toFixed(0)}%` : '' },
    [VAULTS.yoETH.address]: { apy: snapETH?.totalApyFormatted ?? '...', reward: snapETH?.rewardApy ? `+${snapETH.rewardApy.toFixed(0)}%` : '' },
    [VAULTS.yoBTC.address]: { apy: snapBTC?.totalApyFormatted ?? '...', reward: snapBTC?.rewardApy ? `+${snapBTC.rewardApy.toFixed(0)}%` : '' },
    [VAULTS.yoEUR.address]: { apy: snapEUR?.totalApyFormatted ?? '...', reward: snapEUR?.rewardApy ? `+${snapEUR.rewardApy.toFixed(0)}%` : '' },
  }

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
    { vault: VAULTS.yoEUR, position: posEUR, vaultData: dataEUR },
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
    <div className="bg-bg-card border border-border-default rounded-xl overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border-subtle">
            {['Vault', 'Shares Held', 'Asset Value', 'Est. Yield/yr', 'APY', 'Actions'].map((col) => (
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
            const sharesStr = fmtShares(position.shares, vault.decimals, vault.name)
            const snap = snapshots[vault.address]
            const apyStr = snap?.apy ?? '...'
            const rewardStr = snap?.reward ?? ''

            return (
              <motion.tr
                key={vault.address}
                variants={fadeUp}
                className="border-b border-border-subtle last:border-b-0 hover:bg-bg-card-hover transition-colors"
              >
                {/* Vault */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <VaultIcon symbol={vault.name} size={32} />
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
                    {sharesStr}
                  </span>
                </td>

                {/* Current Value */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-text-primary">
                    {fmtAssets(position.assets, vault.decimals, vault.assetSymbol)}
                  </span>
                </td>

                {/* Yield */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-text-secondary">{(() => { const a = parseFloat(formatUnits(position.assets, vault.decimals)); const rate = parseFloat((snapshots[vault.address]?.apy ?? '0%').replace('%','')); const y = a * (rate/100); return y > 0 ? `${y.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${vault.assetSymbol}` : '...' })()}</span>
                </td>

                {/* APY */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-roboto-mono text-sm text-accent-amber">
                      {apyStr}
                    </span>
                    {rewardStr && (
                      <span className="text-text-tertiary text-[10px] font-inter">
                        (incl. reward)
                      </span>
                    )}
                  </div>
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
                      onClick={() => router.push(`/redeem?vault=${vault.name}`)}
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

// ── TxHistorySection ──────────────────────────────────────────────────────────

// Unified display type for merged Supabase + SDK history
interface DisplayTx {
  id: string
  action: string
  vaultName: string
  amountDisplay: string
  txHash: string | null
  timestamp: Date
  source: 'supabase' | 'sdk'
}

function normalizeSdkEntry(
  entry: SdkHistoryEntry,
  vaultName: string
): DisplayTx {
  return {
    id: entry.transactionHash ? `sdk-${entry.transactionHash}` : `sdk-${entry.blockTimestamp}-${vaultName}`,
    action: entry.type,
    vaultName,
    amountDisplay: entry.assets?.formatted ?? '...',
    txHash: entry.transactionHash || null,
    timestamp: entry.blockTimestamp ? new Date(entry.blockTimestamp * 1000) : new Date(entry.createdAt),
    source: 'sdk',
  }
}

function normalizeSupabaseTx(tx: Transaction): DisplayTx {
  return {
    id: tx.id,
    action: tx.action,
    vaultName: tx.vault_name,
    amountDisplay: tx.amount_display,
    txHash: tx.tx_hash,
    timestamp: new Date(tx.created_at),
    source: 'supabase',
  }
}

function TxHistorySection() {
  const { isConnected } = useAccount()
  const { data: txs = [], isLoading } = useTransactions(10)

  // Feature #6: SDK history for all 3 vaults - hooks BEFORE early return
  const { data: histUSD = [] } = useUserHistory(VAULTS.yoUSD.address)
  const { data: histETH = [] } = useUserHistory(VAULTS.yoETH.address)
  const { data: histBTC = [] } = useUserHistory(VAULTS.yoBTC.address)
  const { data: histEUR = [] } = useUserHistory(VAULTS.yoEUR.address)

  if (!isConnected) return null

  // Normalize & merge
  const supabaseTxs: DisplayTx[] = txs.map(normalizeSupabaseTx)
  const sdkTxs: DisplayTx[] = [
    ...histUSD.map((e) => normalizeSdkEntry(e, 'yoUSD')),
    ...histETH.map((e) => normalizeSdkEntry(e, 'yoETH')),
    ...histBTC.map((e) => normalizeSdkEntry(e, 'yoBTC')),
    ...histEUR.map((e) => normalizeSdkEntry(e, 'yoEUR')),
  ]

  // Merge with deduplication by txHash
  const seenHashes = new Set<string>()
  const merged: DisplayTx[] = []

  // Supabase entries take precedence (added first)
  for (const tx of supabaseTxs) {
    if (tx.txHash) {
      const key = tx.txHash.toLowerCase()
      if (seenHashes.has(key)) continue
      seenHashes.add(key)
    }
    merged.push(tx)
  }

  // SDK entries fill gaps
  for (const tx of sdkTxs) {
    if (tx.txHash) {
      const key = tx.txHash.toLowerCase()
      if (seenHashes.has(key)) continue
      seenHashes.add(key)
    }
    merged.push(tx)
  }

  const sorted = merged
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20)

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
        className="bg-bg-card border border-border-default rounded-xl overflow-x-auto"
      >
        {isLoading ? (
          <div className="px-5 py-10 text-center font-inter text-text-tertiary text-sm">Loading transactions…</div>
        ) : sorted.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-inter text-text-tertiary text-sm">No transactions yet</p>
            <p className="font-inter text-text-tertiary text-xs mt-1">Your deposits and redeems will appear here</p>
          </div>
        ) : (
          <table className="w-full min-w-[560px]">
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
              {sorted.map((entry) => (
                <motion.tr
                  key={entry.id}
                  variants={fadeUp}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.action === 'deposit' ? 'bg-accent-amber' : 'bg-blue-400'}`} />
                      <span className="font-inter text-sm text-text-primary capitalize">{entry.action}</span>
                      {entry.source === 'sdk' && (
                        <span className="font-inter text-[10px] text-text-tertiary border border-border-subtle px-1 rounded">
                          onchain
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-space-grotesk text-sm text-text-primary font-semibold">{entry.vaultName}</td>
                  <td className="px-5 py-4 font-roboto-mono text-sm text-text-primary">{entry.amountDisplay}</td>
                  <td className="px-5 py-4">
                    {entry.txHash ? (
                      <a
                        href={`https://basescan.org/tx/${entry.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-roboto-mono text-xs text-accent-amber hover:underline"
                      >
                        {entry.txHash.slice(0, 8)}…
                      </a>
                    ) : (
                      <span className="font-roboto-mono text-xs text-text-tertiary">...</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-text-tertiary text-xs font-inter">
                    {timeAgo(entry.timestamp)}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        )}
      </motion.div>
    </section>
  )
}

// ── MerklRewardsSection ──────────────────────────────────────────────────────────────

function MerklRewardsSection() {
  const { isConnected } = useAccount()
  const { data: rewards, isLoading } = useMerklRewards()
  const { claim, isPending, isSuccess, error } = useClaimMerklRewards()

  if (!isConnected) return null

  const claimableTokens = getClaimableTokens(rewards)

  if (isLoading) return null
  if (claimableTokens.length === 0 && !isSuccess) return null

  return (
    <motion.section variants={fadeUp} initial="hidden" animate="visible">
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-5"
        style={{ borderColor: 'rgba(22,163,74,0.4)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--accent-green)' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'var(--accent-green)' }} />
            </span>
            <h3 className="font-space-grotesk text-text-primary font-semibold">Merkl Rewards</h3>
            <span className="font-inter text-text-tertiary text-xs">Claimable</span>
          </div>

          {isSuccess ? (
            <span className="font-inter text-sm text-accent-green font-medium">
              Claimed successfully
            </span>
          ) : (
            rewards && claimableTokens.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => claim(rewards)}
                disabled={isPending}
                className={`rounded-lg px-4 py-2 font-inter text-sm font-semibold transition-colors ${
                  isPending
                    ? 'bg-accent-green/40 text-black cursor-wait'
                    : 'bg-accent-green text-black hover:opacity-90'
                }`}
              >
                {isPending ? 'Claiming...' : 'Claim All'}
              </motion.button>
            )
          )}
        </div>

        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="font-inter text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          {claimableTokens.map((reward) => (
            <div
              key={reward.token.address}
              className="flex items-center justify-between p-3 bg-bg-card-hover rounded-lg border border-border-subtle"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-border-default flex items-center justify-center">
                  <span className="font-roboto-mono text-[10px] text-text-secondary font-bold">
                    {reward.token.symbol.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="font-space-grotesk text-text-primary text-sm font-semibold">
                    {reward.token.symbol}
                  </p>
                  <p className="font-inter text-text-tertiary text-xs">
                    {reward.token.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-roboto-mono text-text-primary text-sm font-medium">
                  {formatTokenAmount(reward.amount, reward.claimed, reward.token.decimals)}
                </p>
                <p className="font-inter text-text-tertiary text-xs">claimable</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.section>
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
        className="max-w-[1280px] mx-auto px-4 sm:px-10 py-10 space-y-10"
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

        {/* ── Pending Redemptions (Feature #4) ──────────────────────────────── */}
        <PendingRedemptionsSection />

        {/* ── Merkl Rewards Claim ────────────────────────────────────────── */}
        <MerklRewardsSection />

        {/* ── APY Yield Chart (Feature #3) ──────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={fadeUp}
            className="font-space-grotesk text-text-primary text-xl font-bold mb-4"
          >
            Yield Performance
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <YieldChart />
            <TvlChart />
          </div>
        </motion.section>

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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
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
                assetSymbol="..."
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
