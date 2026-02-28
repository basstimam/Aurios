'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { AppLayout, StepIndicator } from '@/components'

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

// ── Data ──────────────────────────────────────────────────────────────────────

const VAULTS_DISPLAY = [
  {
    key: 'yoUSD',
    name: 'yoUSD',
    asset: 'USDC',
    description: 'Stablecoin yield',
    apy: '8.4%',
    tvl: '$4.2M',
    color: '#F59E0B',
  },
  {
    key: 'yoETH',
    name: 'yoETH',
    asset: 'WETH',
    description: 'ETH staking yield',
    apy: '5.2%',
    tvl: '$6.8M',
    color: '#3B82F6',
  },
  {
    key: 'yoBTC',
    name: 'yoBTC',
    asset: 'cbBTC',
    description: 'BTC yield',
    apy: '3.8%',
    tvl: '$3.7M',
    color: '#22C55E',
  },
]

export default function ChooseVaultPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[700px] mx-auto px-6 py-10"
      >
        <StepIndicator currentStep={1} />

        <motion.h1
          variants={fadeUp}
          className="font-space-grotesk text-text-primary text-2xl font-bold mt-8 mb-2"
        >
          Choose a Vault
        </motion.h1>
        <motion.p variants={fadeUp} className="text-text-secondary font-inter text-sm mb-8">
          Select where you&apos;d like to deposit your treasury funds
        </motion.p>

        {/* 2x2 grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {VAULTS_DISPLAY.map((vault) => (
            <motion.button
              key={vault.key}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(vault.key)}
              className={`text-left p-5 rounded-xl border transition-colors ${
                selected === vault.key
                  ? 'border-accent-amber bg-accent-amber/5'
                  : 'border-border-default bg-bg-card hover:border-border-strong'
              }`}
            >
              {/* Vault icon circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-black font-bold text-sm"
                style={{ backgroundColor: vault.color }}
              >
                {vault.asset[0]}
              </div>
              <p className="font-space-grotesk text-text-primary font-semibold mb-1">
                {vault.name}
              </p>
              <p className="text-text-secondary text-xs font-inter mb-3">
                {vault.description}
              </p>
              <div className="flex gap-4">
                <span className="text-accent-amber font-roboto-mono text-sm font-bold">
                  {vault.apy} APY
                </span>
                <span className="text-text-tertiary font-roboto-mono text-sm">
                  {vault.tvl} TVL
                </span>
              </div>
            </motion.button>
          ))}

          {/* Coming Soon card */}
          <motion.div
            variants={fadeUp}
            className="p-5 rounded-xl border border-border-subtle bg-bg-card opacity-50 cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-full bg-border-default flex items-center justify-center mb-3">
              <span className="text-text-tertiary text-lg">+</span>
            </div>
            <p className="font-space-grotesk text-text-tertiary font-semibold mb-1">
              More Coming Soon
            </p>
            <p className="text-text-tertiary text-xs font-inter opacity-60">
              Additional vaults in development
            </p>
          </motion.div>
        </motion.div>

        {/* Continue button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            selected && router.push('/deposit/amount?vault=' + selected)
          }
          disabled={!selected}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
            selected
              ? 'bg-accent-amber text-black hover:bg-accent-amber-dark'
              : 'bg-accent-amber text-black opacity-40 cursor-not-allowed'
          }`}
        >
          Continue →
        </motion.button>
      </motion.div>
    </AppLayout>
  )
}
