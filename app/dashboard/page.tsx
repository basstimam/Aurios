'use client'

import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { AppLayout, VaultCard } from '@/components'
import { useVaultData } from '@/hooks/useVaultData'
import { useUserPosition } from '@/hooks/useUserPosition'
import { VAULTS, VAULT_LIST, VaultConfig } from '@/lib/contracts/vaults'

// ── Helpers ──────────────────────────────────────────────────────────────────

const VAULT_APY: Record<string, string> = {
  yoUSD: '8.4%',
  yoETH: '5.2%',
  yoBTC: '3.8%',
}

function fmtAssets(assets: bigint, decimals: number, symbol: string): string {
  const val = parseFloat(formatUnits(assets, decimals))
  const precision = decimals === 6 ? 2 : decimals === 8 ? 6 : 4
  return `${val.toFixed(precision)} ${symbol}`
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
    <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-6">
      <p className="text-[#9B9081] text-sm font-inter mb-2">{title}</p>
      <p className="font-roboto-mono text-[#F4EFE8] text-3xl font-bold mb-1">{value}</p>
      <p className="text-[#6B625A] text-xs font-inter">{subtitle}</p>
    </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Balance" value="—" subtitle="Connect wallet to view" />
        <StatCard title="Total Yield Earned" value="—" subtitle="Connect wallet to view" />
        <StatCard title="Active Positions" value="—" subtitle="Connect wallet to view" />
      </div>
    )
  }

  const activeCount = [posUSD, posETH, posBTC].filter(
    (p) => p != null && p.shares > BigInt(0)
  ).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
    </div>
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
      <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5">
        <p className="text-[#6B625A] text-center py-12 font-inter">
          Connect your wallet to view your active positions
        </p>
      </div>
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
      <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5">
        <p className="text-[#6B625A] text-center py-12 font-inter">
          No active positions yet.{' '}
          <button
            onClick={() => router.push('/deposit/choose')}
            className="text-[#F59E0B] underline hover:no-underline transition-all"
          >
            Deposit into a vault
          </button>{' '}
          to start earning yield.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1C1D27]">
            {['Vault', 'Deposited', 'Current Value', 'Yield', 'APY', 'Actions'].map((col) => (
              <th
                key={col}
                className="text-[#9B9081] text-sm font-inter font-normal text-left px-6 py-4 first:pl-5"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRows.map(({ vault, position }) => {
            const depositedStr = fmtAssets(position.assets, vault.decimals, vault.assetSymbol)
            const apyStr = VAULT_APY[vault.name] ?? '—'


            return (
              <tr
                key={vault.address}
                className="border-b border-[#1C1D27] last:border-b-0 hover:bg-[#0F1020] transition-colors"
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
                      <p className="font-space-grotesk text-sm font-semibold text-[#F4EFE8]">
                        {vault.name}
                      </p>
                      <p className="font-inter text-xs text-[#9B9081]">
                        {vault.assetSymbol}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Deposited */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-[#F4EFE8]">
                    {depositedStr}
                  </span>
                </td>

                {/* Current Value */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-[#F4EFE8]">
                    {depositedStr}
                  </span>
                </td>

                {/* Yield */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-[#9B9081]">—</span>
                </td>

                {/* APY */}
                <td className="px-6 py-4">
                  <span className="font-roboto-mono text-sm text-[#F59E0B]">
                    {apyStr}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push('/deposit/choose')}
                      className="bg-[#F59E0B] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#D97706] text-sm transition-colors"
                    >
                      Deposit
                    </button>
                    <button className="border border-[#252838] text-[#9B9081] px-4 py-2 rounded-lg hover:border-[#F59E0B] hover:text-[#F59E0B] text-sm transition-colors">
                      Withdraw
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto px-10 py-10 space-y-10">

        {/* ── Portfolio Summary ─────────────────────────────────────────────── */}
        <section>
          <h2 className="font-space-grotesk text-[#F4EFE8] text-xl font-bold mb-6">
            Portfolio Summary
          </h2>
          <PortfolioStats />
        </section>

        {/* ── Available Vaults ──────────────────────────────────────────────── */}
        <section>
          <h2 className="font-space-grotesk text-[#F4EFE8] text-xl font-bold mb-4">
            Available Vaults
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VAULT_LIST.map((vault) => (
              <VaultCardWrapper
                key={vault.address}
                vault={vault}
                onClick={() => router.push('/deposit/choose')}
              />
            ))}
            <VaultCard
              name="More Coming Soon"
              assetSymbol="—"
              description="New yield opportunities being added"
              color="#6B625A"
              isDisabled
            />
          </div>
        </section>

        {/* ── Active Positions ──────────────────────────────────────────────── */}
        <section>
          <h2 className="font-space-grotesk text-[#F4EFE8] text-xl font-bold mb-4">
            Active Positions
          </h2>
          <PositionsTable />
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-[#1C1D27] pt-8 text-center">
          <p className="font-inter text-sm text-[#6B625A]">
            Powered by{' '}
            <span className="text-[#F59E0B] font-medium">YO Protocol</span>
          </p>
        </footer>

      </div>
    </AppLayout>
  )
}
