'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── SVG Icons ──────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg className="w-5 h-5 text-accent-amber flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface RiskDisclosureProps {
  action: 'deposit' | 'redeem'
  vaultName: string
  onAccept: () => void
  onCancel: () => void
  isOpen: boolean
}

const RISKS = [
  'Smart contract risk: funds interact with onchain contracts that may contain undiscovered vulnerabilities.',
  'Market risk: the value of deposited assets may fluctuate based on market conditions.',
  'Liquidity risk: redemptions may take up to 48 hours to process during high-demand periods.',
  'Protocol risk: YO Protocol yield strategies depend on third-party DeFi integrations.',
]

// ── Component ──────────────────────────────────────────────────────────────────

export function RiskDisclosure({ action, vaultName, onAccept, onCancel, isOpen }: RiskDisclosureProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-bg-card border border-border-default rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <ShieldIcon />
              <h3 className="font-space-grotesk text-text-primary font-semibold text-lg">
                Confirm {action === 'deposit' ? 'Deposit' : 'Redemption'}
              </h3>
            </div>

            <p className="font-inter text-text-secondary text-sm mb-4">
              You are about to {action === 'deposit' ? 'deposit funds into' : 'redeem shares from'}{' '}
              <span className="text-accent-amber font-medium">{vaultName}</span>.
              Please review the following risks:
            </p>

            {/* Risk list */}
            <div className="space-y-3 mb-5">
              {RISKS.map((risk, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <WarningIcon />
                  <p className="font-inter text-text-secondary text-xs leading-relaxed">{risk}</p>
                </div>
              ))}
            </div>

            {/* Acknowledge checkbox */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-4.5 h-4.5 rounded border-2 transition-colors flex items-center justify-center ${
                    acknowledged
                      ? 'bg-accent-amber border-accent-amber'
                      : 'border-border-strong group-hover:border-accent-amber'
                  }`}
                  style={{ width: 18, height: 18 }}
                >
                  {acknowledged && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="font-inter text-text-primary text-sm leading-snug">
                I understand the risks and wish to proceed with this transaction.
              </span>
            </label>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg border border-border-default text-text-secondary font-inter text-sm font-medium hover:border-border-strong transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (acknowledged) {
                    setAcknowledged(false)
                    onAccept()
                  }
                }}
                disabled={!acknowledged}
                className={`flex-1 py-2.5 rounded-lg font-inter text-sm font-semibold transition-colors ${
                  acknowledged
                    ? 'bg-accent-amber text-black hover:bg-accent-amber-dark'
                    : 'bg-accent-amber/40 text-black/40 cursor-not-allowed'
                }`}
              >
                {action === 'deposit' ? 'Confirm Deposit' : 'Confirm Redeem'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
