'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { AppLayout, StepIndicator } from '@/components'
import { VAULT_LIST } from '@/lib/contracts/vaults'
import type { VaultConfig } from '@/lib/contracts/vaults'
import { useVaultData } from '@/hooks/useVaultData'
import { useVaultSnapshot } from '@/hooks/useVaultSnapshot'
import { useVaultPaused } from '@/hooks/useVaultPaused'
import { VaultAdvisor } from '@/components/VaultAdvisor'
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

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.07 } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTVL(totalAssets: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(totalAssets, decimals))
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${symbol}`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K ${symbol}`
  return `${val.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`
}

// ── VaultOption ───────────────────────────────────────────────────────────────

function VaultOption({
  vault,
  selected,
  onSelect,
}: {
  vault: VaultConfig
  selected: boolean
  onSelect: () => void
}) {
  const { data: vaultData } = useVaultData(vault.address)
  const { data: snapshot } = useVaultSnapshot(vault.address)
  const { data: isPaused } = useVaultPaused(vault.address)
  const tvl =
    vaultData?.totalAssets != null
      ? fmtTVL(vaultData.totalAssets, vault.decimals, vault.assetSymbol)
      : '...'
  const apy = snapshot?.apyFormatted ?? '...'

  return (
    <motion.button
      variants={fadeUp}
      whileHover={isPaused ? undefined : { scale: 1.02 }}
      whileTap={isPaused ? undefined : { scale: 0.97 }}
      onClick={isPaused ? undefined : onSelect}
      disabled={isPaused === true}
      className={`text-left p-5 rounded-xl border transition-colors relative ${ 
        isPaused
          ? 'border-border-subtle bg-bg-card opacity-50 cursor-not-allowed'
          : selected
          ? 'border-accent-amber bg-accent-amber/5'
          : 'border-border-default bg-bg-card hover:border-border-strong'
      }`}
    >
      {/* Paused badge */}
      {isPaused && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
          <span className="font-inter text-[10px] text-red-400 font-medium">Paused</span>
        </div>
      )}
      {/* Vault icon circle */}
      <VaultIcon assetSymbol={vault.assetSymbol} size={40} />
      <p className="font-space-grotesk text-text-primary font-semibold mb-1">{vault.name}</p>
      <p className="text-text-secondary text-xs font-inter mb-3">{vault.description}</p>
      <div className="flex gap-4">
        <span className="text-accent-amber font-roboto-mono text-sm font-bold">{apy} APY</span>
        <span className="text-text-tertiary font-roboto-mono text-sm">
          {tvl === '...' ? (
            <span className="inline-block w-12 h-3 bg-border-default rounded animate-pulse" />
          ) : (
            <>{tvl} TVL</>
          )}
        </span>
      </div>
    </motion.button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChooseVaultPage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [selected, setSelected] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('aurios_vault') ?? null
    return null
  })
  const [showAdvisor, setShowAdvisor] = useState(false)

  // Persist selection to sessionStorage
  useEffect(() => {
    if (selected) sessionStorage.setItem('aurios_vault', selected)
  }, [selected])

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isConnected) router.replace('/dashboard')
  }, [isConnected, router])

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

        {/* Smart Advisor toggle */}
        <motion.div variants={fadeUp} className="mb-6">
          <button
            onClick={() => setShowAdvisor((v) => !v)}
            className="flex items-center gap-2 text-accent-amber font-inter text-sm font-medium hover:underline transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            {showAdvisor ? 'Hide Smart Advisor' : 'Need help choosing? Try Smart Advisor'}
          </button>
        </motion.div>

        <AnimatePresence>
          {showAdvisor && <VaultAdvisor onSelect={setSelected} />}
        </AnimatePresence>

        {/* Vault grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {VAULT_LIST.map((vault) => (
            <VaultOption
              key={vault.address}
              vault={vault}
              selected={selected === vault.name}
              onSelect={() => setSelected(vault.name)}
            />
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
          onClick={() => selected && router.push('/deposit/amount?vault=' + selected)}
          disabled={!selected}
          className={`w-full py-3 rounded-lg font-semibold font-inter transition-colors ${
            selected
              ? 'bg-accent-amber text-black hover:bg-accent-amber-dark'
              : 'bg-accent-amber text-black opacity-40 cursor-not-allowed'
          }`}
        >
          Continue →
        </motion.button>

        {/* Back link */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="w-full mt-3 text-center text-text-secondary text-sm font-inter hover:text-text-primary transition-colors"
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>
    </AppLayout>
  )
}
