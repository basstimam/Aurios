'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { motion, type Variants } from 'framer-motion'
import { formatUnits } from 'viem'
import { AppLayout } from '@/components'
import { useUserPosition } from '@/hooks/useUserPosition'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { useTokenPrices, VAULT_PRICE_KEY } from '@/hooks/useTokenPrices'
import {
  useSavingsGoals,
  useCreateGoal,
  useDeleteGoal,
  projectMonths,
  formatMonths,
  type SavingsGoal,
  type CreateGoalInput,
} from '@/hooks/useSavingsGoals'
import { VAULTS, type VaultKey } from '@/lib/contracts/vaults'

// ── Animation variants ─────────────────────────────────────────────────────

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

const formReveal: Variants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', overflow: 'visible', transition: { duration: 0.3, ease: 'easeOut' } },
}

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtUsd(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const VAULT_KEYS = Object.keys(VAULTS) as VaultKey[]

// ── GoalCard ──────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  walletAddress,
}: {
  goal: SavingsGoal
  walletAddress: string
}) {
  const vault = VAULTS[goal.vault_key as VaultKey]
  const { data: position } = useUserPosition(goal.vault_address as `0x${string}`)
  const { data: prices } = useTokenPrices()
  const { data: snapshot } = useVaultSnapshot(goal.vault_address as `0x${string}`)
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal()

  // Derive current USD value from on-chain position
  const currentUsd = (() => {
    if (!position || !vault) return 0
    const assets = parseFloat(formatUnits(position.assets, vault.decimals))
    const priceKey = VAULT_PRICE_KEY[goal.vault_address.toLowerCase()]
    const price = priceKey && prices ? prices[priceKey] : 1
    return assets * price
  })()

  const progressPct = goal.target_usd > 0
    ? Math.min((currentUsd / goal.target_usd) * 100, 100)
    : 0

  const months = projectMonths({
    currentUsd,
    targetUsd: goal.target_usd,
    totalApyPercent: snapshot?.totalApy ?? 0,
    monthlyDepositUsd: goal.monthly_deposit_usd,
  })

  const vaultColor = vault?.color ?? 'var(--accent-amber)'

  function handleDelete() {
    deleteGoal({ id: goal.id, wallet_address: walletAddress })
  }

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="relative bg-bg-card border border-border-default rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-4"
    >
      {/* Delete button — top-right */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete goal"
        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-accent-red hover:bg-bg-card-hover transition-colors disabled:opacity-40"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {/* Header: vault badge + name */}
      <div className="pr-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: vaultColor }}
          />
          <span
            className="text-xs font-inter font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: vaultColor,
              borderColor: `${vaultColor}40`,
              backgroundColor: `${vaultColor}12`,
            }}
          >
            {goal.vault_key}
          </span>
        </div>
        <h3 className="font-space-grotesk text-text-primary font-bold text-base leading-snug">
          {goal.name}
        </h3>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-border-subtle rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              backgroundColor: vaultColor,
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-roboto-mono text-sm text-text-primary">
            {fmtUsd(currentUsd)}
          </span>
          <span className="font-roboto-mono text-sm text-text-secondary">
            {fmtUsd(goal.target_usd)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-inter text-xs text-text-tertiary">
            {progressPct.toFixed(1)}% funded
          </span>
          <span className="font-inter text-xs text-text-secondary font-medium">
            {formatMonths(months)}
          </span>
        </div>
      </div>

      {/* Meta info */}
      <div className="border-t border-border-subtle pt-3 space-y-1.5">
        {goal.monthly_deposit_usd > 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="font-inter text-xs text-text-secondary">
              Depositing <span className="font-medium text-text-primary">{fmtUsd(goal.monthly_deposit_usd)}</span>/mo
            </span>
          </div>
        )}
        {snapshot && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <span className="font-inter text-xs text-text-secondary">
              APY <span className="font-medium" style={{ color: vaultColor }}>{snapshot.totalApyFormatted}</span>
            </span>
          </div>
        )}
        {goal.deadline && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary flex-shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="font-inter text-xs text-text-secondary">
              Target{' '}
              <span className="text-text-primary font-medium">
                {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── GoalForm ──────────────────────────────────────────────────────────────

function GoalForm({
  walletAddress,
  onSuccess,
}: {
  walletAddress: string
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [vaultKey, setVaultKey] = useState<VaultKey>('yoUSD')
  const [targetUsd, setTargetUsd] = useState('')
  const [monthlyDepositUsd, setMonthlyDepositUsd] = useState('')
  const [deadline, setDeadline] = useState('')

  const { mutateAsync, isPending, error } = useCreateGoal()

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-border-default bg-bg-card text-text-primary text-sm font-inter focus:outline-none focus:border-accent-amber transition-colors placeholder:text-text-tertiary'

  const labelClass =
    'block font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const target = parseFloat(targetUsd)
    if (!name.trim() || !target || target <= 0) return

    const input: CreateGoalInput = {
      wallet_address: walletAddress,
      name: name.trim(),
      vault_key: vaultKey,
      vault_address: VAULTS[vaultKey].address,
      target_usd: target,
      monthly_deposit_usd: parseFloat(monthlyDepositUsd) || 0,
      deadline: deadline || null,
    }

    await mutateAsync(input)
    onSuccess()
  }

  return (
    <motion.div
      variants={formReveal}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="bg-bg-card border border-border-default rounded-xl p-6 mb-6 shadow-card"
    >
      <h2 className="font-space-grotesk text-text-primary font-bold text-lg mb-5">
        New Treasury Goal
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Goal name */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Goal Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Emergency Fund, ETH Stack"
            className={inputClass}
            required
          />
        </div>

        {/* Vault */}
        <div>
          <label className={labelClass}>Vault</label>
          <select
            value={vaultKey}
            onChange={e => setVaultKey(e.target.value as VaultKey)}
            className={inputClass}
          >
            {VAULT_KEYS.map(key => (
              <option key={key} value={key}>
                {key} ({VAULTS[key].assetSymbol})
              </option>
            ))}
          </select>
        </div>

        {/* Target amount */}
        <div>
          <label className={labelClass}>Target Amount (USD)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={targetUsd}
            onChange={e => setTargetUsd(e.target.value)}
            placeholder="10000"
            className={inputClass}
            required
          />
        </div>

        {/* Monthly deposit */}
        <div>
          <label className={labelClass}>Monthly Deposit (USD)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyDepositUsd}
            onChange={e => setMonthlyDepositUsd(e.target.value)}
            placeholder="0 (optional)"
            className={inputClass}
          />
        </div>

        {/* Deadline */}
        <div>
          <label className={labelClass}>Target Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="sm:col-span-2">
            <p className="font-inter text-xs text-accent-red">{(error as Error).message}</p>
          </div>
        )}

        {/* Submit */}
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending || !name.trim() || !targetUsd}
            className="h-10 px-6 rounded-lg text-sm font-inter font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
          >
            {isPending ? 'Creating…' : 'Create Goal'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="text-center py-20"
    >
      <div className="text-4xl mb-3 text-text-tertiary select-none">◎</div>
      <p className="text-text-primary font-semibold font-space-grotesk">
        No treasury goals yet
      </p>
      <p className="text-text-secondary text-sm mt-1 font-inter">
        Set your first treasury target to start tracking deployment progress
      </p>
    </motion.div>
  )
}

// ── GoalsPage ─────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { authenticated } = usePrivy()
  const { address } = useAccount()
  const [showForm, setShowForm] = useState(false)

  const { data: goals = [], isLoading } = useSavingsGoals(address)

  // Guard: not connected
  if (!authenticated) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-8 py-20 text-center">
          <p className="text-text-secondary font-inter">
            Connect your wallet to view treasury goals
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-8 py-10"
      >
        {/* Header row */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold font-space-grotesk text-text-primary">
              Treasury Goals
            </h1>
            <p className="text-sm text-text-secondary mt-1 font-inter">
              Track your team&apos;s treasury targets and capital deployment goals
            </p>
          </div>
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="h-9 px-4 rounded-lg text-sm font-inter font-semibold transition-opacity hover:opacity-90"
            style={
              showForm
                ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }
                : { backgroundColor: 'var(--accent-amber)', color: '#000' }
            }
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </motion.div>

        {/* Inline creation form */}
        {showForm && address && (
          <GoalForm
            walletAddress={address}
            onSuccess={() => setShowForm(false)}
          />
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
              <p className="font-inter text-text-secondary text-sm">Loading goals…</p>
            </div>
          </div>
        )}

        {/* Goals grid */}
        {!isLoading && goals.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                walletAddress={address ?? ''}
              />
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && goals.length === 0 && <EmptyState />}
      </motion.div>
    </AppLayout>
  )
}
