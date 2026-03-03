'use client'

import { useAccount } from 'wagmi'
import { motion, type Variants } from 'framer-motion'
import { AppLayout } from '@/components'
import {
  useMerklRewards,
  useClaimMerklRewards,
  getClaimableTokens,
  formatTokenAmount,
} from '@/hooks/useMerklRewards'

// ── Animation Variants ─────────────────────────────────────────────────────────

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
}

// ── Token Row ──────────────────────────────────────────────────────────────────

function TokenRow({
  symbol,
  name,
  amount,
  claimed,
  decimals,
  isLast,
}: {
  symbol: string
  name: string
  amount: string
  claimed: string
  decimals: number
  isLast: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`flex items-center justify-between px-5 py-4 hover:bg-bg-card-hover transition-colors ${
        !isLast ? 'border-b border-border-subtle' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(217,119,6,0.10)' }}
        >
          <span className="font-roboto-mono text-xs font-bold" style={{ color: 'var(--accent-amber)' }}>
            {symbol.slice(0, 3)}
          </span>
        </div>
        <div>
          <p className="font-space-grotesk text-text-primary text-sm font-semibold">{symbol}</p>
          <p className="font-inter text-text-tertiary text-xs">{name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-roboto-mono text-text-primary text-sm font-medium">
          {formatTokenAmount(amount, claimed, decimals)}
        </p>
        <p className="font-inter text-text-tertiary text-xs">claimable</p>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const { isConnected } = useAccount()
  const { data: rewards, isLoading } = useMerklRewards()
  const { claim, isPending, isSuccess, error, reset } = useClaimMerklRewards()

  const claimableTokens = getClaimableTokens(rewards)
  const hasRewards = claimableTokens.length > 0

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[720px] mx-auto px-4 sm:px-10 py-10 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <h1 className="font-space-grotesk text-text-primary text-3xl font-bold mb-2">Rewards</h1>
          <p className="font-inter text-text-secondary text-sm">
            Merkl rewards earned from YO Protocol vault deposits on Base Mainnet.
          </p>
        </motion.div>

        {/* Reward types info */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border-default rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-1 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-amber)' }}
              />
              <p className="font-space-grotesk text-text-primary font-semibold text-sm">Vault Yield</p>
            </div>
            <p className="font-inter text-text-secondary text-sm leading-relaxed">
              Base APY automatically compounded into the vault share price. This yield runs
              continuously while funds are deposited — no action required. Reflected in real-time on the Dashboard.
            </p>
          </div>
          <div className="bg-bg-card border border-border-default rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-1 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-green)' }}
              />
              <p className="font-space-grotesk text-text-primary font-semibold text-sm">Merkl Rewards</p>
            </div>
            <p className="font-inter text-text-secondary text-sm leading-relaxed">
              Additional token incentives distributed by{' '}
              <a href="https://merkl.angle.money" target="_blank" rel="noopener noreferrer" className="text-accent-amber hover:underline">Merkl</a>
              {' '}on top of vault yield. These rewards are{' '}
              <span className="text-text-primary font-medium">not automatic</span> —
              they must be manually claimed from this page whenever there is a claimable balance.
            </p>
          </div>
        </motion.div>

        {/* Not connected */}
        {!isConnected && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-bg-card border border-border-default rounded-xl p-12 text-center"
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(217,119,6,0.08)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="font-space-grotesk text-text-primary font-semibold mb-1">Wallet not connected</p>
            <p className="font-inter text-text-tertiary text-sm">Connect your wallet to view claimable rewards</p>
          </motion.div>
        )}

        {/* Loading skeleton */}
        {isConnected && isLoading && (
          <div className="space-y-3">
            <div className="bg-bg-card border border-border-default rounded-xl p-5 h-20 animate-pulse" />
            <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
              {[1, 2].map((i) => (
                <div key={i} className="px-5 py-4 h-[72px] animate-pulse border-b border-border-subtle last:border-b-0" />
              ))}
            </div>
          </div>
        )}

        {/* Success */}
        {isConnected && isSuccess && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-bg-card border rounded-xl p-10 text-center space-y-4"
            style={{ borderColor: 'rgba(22,163,74,0.4)' }}
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
              style={{ backgroundColor: 'rgba(22,163,74,0.10)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-space-grotesk text-text-primary font-semibold text-lg">Claimed successfully</p>
              <p className="font-inter text-text-tertiary text-sm mt-1">Rewards have been sent to your wallet</p>
            </div>
            <button
              onClick={reset}
              className="font-inter text-xs text-text-tertiary underline hover:no-underline transition-all"
            >
              Check for more rewards
            </button>
          </motion.div>
        )}

        {/* No rewards */}
        {isConnected && !isLoading && !isSuccess && !hasRewards && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-bg-card border border-border-default rounded-xl p-12 text-center"
          >
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(217,119,6,0.08)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-space-grotesk text-text-primary font-semibold mb-1">No claimable rewards</p>
            <p className="font-inter text-text-tertiary text-sm">
              Deposit into a YO vault to start earning Merkl rewards
            </p>
          </motion.div>
        )}

        {/* Rewards available */}
        {isConnected && !isLoading && !isSuccess && hasRewards && (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">

            {/* Summary + Claim button */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border rounded-xl p-5"
              style={{ borderColor: 'rgba(22,163,74,0.35)' }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--accent-green)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: 'var(--accent-green)' }}
                    />
                  </span>
                  <div>
                    <p className="font-space-grotesk text-text-primary font-semibold">
                      {claimableTokens.length} token{claimableTokens.length > 1 ? 's' : ''} ready to claim
                    </p>
                    <p className="font-inter text-text-tertiary text-xs">Merkl &bull; Base Mainnet</p>
                  </div>
                </div>
                {rewards && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => claim(rewards)}
                    disabled={isPending}
                    className={`rounded-lg px-5 py-2.5 font-inter text-sm font-semibold transition-opacity ${
                      isPending ? 'opacity-50 cursor-wait' : 'hover:opacity-90'
                    }`}
                    style={{ backgroundColor: 'var(--accent-green)', color: '#000' }}
                  >
                    {isPending ? 'Claiming...' : 'Claim All'}
                  </motion.button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(220,38,38,0.06)', borderColor: 'rgba(220,38,38,0.2)' }}>
                  <p className="font-inter text-xs text-red-400">{error}</p>
                </div>
              )}
            </motion.div>

            {/* Token list */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
            >
              {claimableTokens.map((reward, i) => (
                <TokenRow
                  key={reward.token.address}
                  symbol={reward.token.symbol}
                  name={reward.token.name}
                  amount={reward.amount}
                  claimed={reward.claimed}
                  decimals={reward.token.decimals}
                  isLast={i === claimableTokens.length - 1}
                />
              ))}
            </motion.div>

            {/* Info note */}
            <motion.div
              variants={fadeUp}
              className="rounded-xl p-4"
              style={{
                backgroundColor: 'rgba(217,119,6,0.05)',
                border: '1px solid rgba(217,119,6,0.15)',
              }}
            >
              <p className="font-inter text-xs text-text-secondary leading-relaxed">
                Rewards are distributed by{' '}
                <a
                  href="https://merkl.angle.money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-amber hover:underline"
                >
                  Merkl
                </a>{' '}
                to YO Protocol vault depositors. Claims submit an on-chain transaction on Base Mainnet.
                Ensure your wallet is connected to Base (chain ID 8453).
              </p>
            </motion.div>

          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  )
}
