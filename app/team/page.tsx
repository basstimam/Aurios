'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { motion, type Variants } from 'framer-motion'
import { AppLayout } from '@/components'
import { useTeam, useTeamMembers, useCreateTeam, useInviteMember, useUpdateMember } from '@/hooks/useTeam'
import { useTeamTransactions } from '@/hooks/useTransactions'
import type { TeamRole, TxAction } from '@/lib/supabase'

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
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<TeamRole, string> = {
  admin:  'bg-amber-500/10 text-amber-500 border border-amber-500/30',
  signer: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  viewer: 'bg-border-default/30 text-text-secondary border border-border-default',
}

const ACTION_DOT: Record<TxAction, string> = {
  deposit: 'bg-accent-amber',
  redeem:  'bg-blue-400',
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function initials(walletAddress: string, displayName?: string | null) {
  if (displayName) return displayName.slice(0, 2).toUpperCase()
  return walletAddress.slice(2, 4).toUpperCase()
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Create Team Modal ──────────────────────────────────────────────────────────

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutateAsync, isPending, error } = useCreateTeam()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await mutateAsync({ name: name.trim(), description: description.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg-card border border-border-default rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <h2 className="font-space-grotesk text-text-primary text-lg font-bold mb-1">Create a Team</h2>
        <p className="font-inter text-text-secondary text-sm mb-5">Set up your DAO treasury team. You&apos;ll be the admin.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5 block">Team Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Compound DAO Treasury"
              className="w-full rounded-lg border border-border-default bg-bg-page px-3 py-2.5 font-inter text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-amber focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of your team's purpose"
              rows={2}
              className="w-full rounded-lg border border-border-default bg-bg-page px-3 py-2.5 font-inter text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-amber focus:outline-none resize-none"
            />
          </div>

          {error && <p className="font-inter text-xs text-red-400">{(error as Error).message}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border-default py-2.5 font-inter text-sm text-text-secondary hover:border-border-strong transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="flex-1 rounded-lg py-2.5 font-inter text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
            >
              {isPending ? 'Creating…' : 'Create Team'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Invite Member Modal ────────────────────────────────────────────────────────

function InviteModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const [wallet, setWallet] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<TeamRole>('signer')
  const { mutateAsync, isPending, error } = useInviteMember()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wallet.trim().startsWith('0x')) return
    await mutateAsync({ teamId, walletAddress: wallet.trim(), role, displayName: displayName.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg-card border border-border-default rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
      >
        <h2 className="font-space-grotesk text-text-primary text-lg font-bold mb-1">Invite Member</h2>
        <p className="font-inter text-text-secondary text-sm mb-5">Add a wallet address to your team.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5 block">Wallet Address</label>
            <input
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-border-default bg-bg-page px-3 py-2.5 font-roboto-mono text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-amber focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5 block">Display Name (optional)</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full rounded-lg border border-border-default bg-bg-page px-3 py-2.5 font-inter text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label className="font-inter text-xs text-text-secondary uppercase tracking-wider mb-1.5 block">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as TeamRole)}
              className="w-full rounded-lg border border-border-default bg-bg-page px-3 py-2.5 font-inter text-sm text-text-primary focus:border-accent-amber focus:outline-none"
            >
              <option value="admin">Admin — full access</option>
              <option value="signer">Signer — can approve transactions</option>
              <option value="viewer">Viewer — read-only</option>
            </select>
          </div>

          {error && <p className="font-inter text-xs text-red-400">{(error as Error).message}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border-default py-2.5 font-inter text-sm text-text-secondary hover:border-border-strong transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !wallet.trim().startsWith('0x')}
              className="flex-1 rounded-lg py-2.5 font-inter text-sm font-semibold disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
            >
              {isPending ? 'Inviting…' : 'Send Invite'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { isConnected, address } = useAccount()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const { data: team, isLoading: teamLoading } = useTeam()
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(team?.id)
  const { data: txHistory = [], isLoading: txLoading } = useTeamTransactions(team?.id)
  const { mutateAsync: updateMember } = useUpdateMember()

  const wallet = address?.toLowerCase()
  const myMembership = members.find(m => m.wallet_address === wallet)
  const isAdmin = myMembership?.role === 'admin'

  // ── Not connected ────────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <AppLayout>
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="max-w-[1280px] mx-auto px-10 py-10">
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 rounded-full bg-bg-card border border-border-default flex items-center justify-center text-text-secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className="font-space-grotesk text-text-primary text-xl font-bold">Team Management</h2>
            <p className="text-text-secondary font-inter text-sm text-center max-w-xs">
              Connect your wallet to view and manage your DAO treasury team.
            </p>
            <button
              onClick={() => document.querySelector<HTMLButtonElement>('[data-rk] button')?.click()}
              className="mt-2 rounded-lg px-5 py-2.5 font-inter text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-amber)', color: '#000000' }}
            >
              Connect Wallet
            </button>
          </motion.div>
        </motion.div>
      </AppLayout>
    )
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (teamLoading) {
    return (
      <AppLayout>
        <div className="max-w-[1280px] mx-auto px-10 py-10 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" />
            <p className="font-inter text-text-secondary text-sm">Loading team…</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // ── No team yet ──────────────────────────────────────────────────────────────
  if (!team) {
    return (
      <AppLayout>
        <motion.div variants={pageVariants} initial="hidden" animate="visible" className="max-w-[1280px] mx-auto px-10 py-10">
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border-default flex items-center justify-center text-accent-amber">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className="text-center">
              <h2 className="font-space-grotesk text-text-primary text-xl font-bold mb-2">No Team Yet</h2>
              <p className="font-inter text-text-secondary text-sm max-w-sm">
                Create a team to start managing your DAO treasury together. Invite signers and viewers to collaborate.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg px-6 py-3 font-inter text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
            >
              Create Team
            </motion.button>
          </motion.div>
        </motion.div>

        {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} />}
      </AppLayout>
    )
  }

  // ── Has team — main view ─────────────────────────────────────────────────────
  return (
    <AppLayout>
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="max-w-[1280px] mx-auto px-10 py-10">

        {/* Page Header */}
        <motion.div variants={fadeUp} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-space-grotesk text-text-primary text-2xl font-bold">{team.name}</h1>
            {team.description && (
              <p className="text-text-secondary text-sm font-inter mt-1">{team.description}</p>
            )}
            {!team.description && (
              <p className="text-text-secondary text-sm font-inter mt-1">
                {members.filter(m => m.status === 'active').length} active members
                {myMembership && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded font-medium ${ROLE_BADGE[myMembership.role as TeamRole] ?? ''}`}>
                    {myMembership.role}
                  </span>
                )}
              </p>
            )}
          </div>
          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInviteModal(true)}
              className="border border-border-default text-text-secondary px-4 py-2 rounded-lg font-inter text-sm hover:border-accent-amber hover:text-accent-amber transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Invite Member
            </motion.button>
          )}
        </motion.div>

        {/* 2-column layout */}
        <div className="flex gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">

            {/* Team Members Table */}
            <motion.div variants={fadeUp} className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
                <h2 className="font-space-grotesk text-text-primary font-semibold">
                  Team Members
                  <span className="ml-2 text-text-tertiary font-inter text-xs font-normal">
                    {membersLoading ? '…' : members.length}
                  </span>
                </h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Joined</th>
                    {isAdmin && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <motion.tbody variants={stagger} initial="hidden" animate="visible">
                  {membersLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-text-tertiary font-inter text-sm">Loading members…</td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-text-tertiary font-inter text-sm">No members yet</td>
                    </tr>
                  ) : members.map((member) => (
                    <motion.tr
                      key={member.id}
                      variants={fadeUp}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-xs text-text-primary font-bold font-space-grotesk">
                            {initials(member.wallet_address, member.display_name)}
                          </div>
                          <div>
                            <p className="text-text-primary text-sm font-inter font-medium">
                              {member.display_name ?? shortAddr(member.wallet_address)}
                            </p>
                            <p className="text-text-tertiary text-xs font-roboto-mono">{shortAddr(member.wallet_address)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded font-inter font-medium ${ROLE_BADGE[member.role as TeamRole] ?? ''}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-inter ${member.status === 'active' ? 'text-accent-green' : 'text-text-secondary'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-text-secondary text-xs font-inter">
                        {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      {isAdmin && member.wallet_address !== wallet && (
                        <td className="px-5 py-4">
                          <select
                            value={member.role}
                            onChange={e => updateMember({
                              memberId: member.id,
                              teamId: team.id,
                              updates: { role: e.target.value as TeamRole },
                            })}
                            className="bg-transparent border border-border-subtle rounded px-1.5 py-1 font-inter text-xs text-text-secondary focus:border-accent-amber focus:outline-none"
                          >
                            <option value="admin">admin</option>
                            <option value="signer">signer</option>
                            <option value="viewer">viewer</option>
                          </select>
                        </td>
                      )}
                      {isAdmin && member.wallet_address === wallet && <td className="px-5 py-4" />}
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>

            {/* Transaction History */}
            <motion.div variants={fadeUp} className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border-subtle">
                <h2 className="font-space-grotesk text-text-primary font-semibold">Team Transactions</h2>
              </div>
              {txLoading ? (
                <div className="px-5 py-8 text-center text-text-tertiary font-inter text-sm">Loading transactions…</div>
              ) : txHistory.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="font-inter text-text-tertiary text-sm">No transactions yet</p>
                  <p className="font-inter text-text-tertiary text-xs mt-1">Deposits and redeems will appear here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Action</th>
                      <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Vault</th>
                      <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">When</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={stagger} initial="hidden" animate="visible">
                    {txHistory.map((tx) => (
                      <motion.tr
                        key={tx.id}
                        variants={fadeUp}
                        className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ACTION_DOT[tx.action as TxAction] ?? ''}`} />
                            <span className="font-inter text-sm text-text-primary capitalize">{tx.action}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-space-grotesk text-sm text-text-primary font-semibold">{tx.vault_name}</td>
                        <td className="px-5 py-4 font-roboto-mono text-sm text-text-primary">{tx.amount_display}</td>
                        <td className="px-5 py-4 text-text-tertiary text-xs font-inter">{timeAgo(tx.created_at)}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-[360px] space-y-6">

            {/* Team Info */}
            <motion.div variants={fadeUp} className="bg-bg-card border border-border-default rounded-xl p-5">
              <h2 className="font-space-grotesk text-text-primary font-semibold mb-4">Team Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary text-sm font-inter">Team ID</span>
                  <span className="font-roboto-mono text-text-tertiary text-xs">{team.id.slice(0, 8)}…</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary text-sm font-inter">Created by</span>
                  <span className="font-roboto-mono text-text-primary text-xs">{shortAddr(team.creator_address)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary text-sm font-inter">Created</span>
                  <span className="font-inter text-text-primary text-xs">
                    {new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary text-sm font-inter">Active members</span>
                  <span className="font-roboto-mono text-text-primary text-sm">
                    {members.filter(m => m.status === 'active').length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Member Stats */}
            <motion.div variants={fadeUp} className="bg-bg-card border border-border-default rounded-xl p-5">
              <h2 className="font-space-grotesk text-text-primary font-semibold mb-4">Member Breakdown</h2>
              <div className="space-y-2.5">
                {(['admin', 'signer', 'viewer'] as TeamRole[]).map(role => {
                  const count = members.filter(m => m.role === role && m.status === 'active').length
                  return (
                    <div key={role} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded font-inter font-medium ${ROLE_BADGE[role]}`}>
                        {role}
                      </span>
                      <span className="font-roboto-mono text-text-primary text-sm">{count}</span>
                    </div>
                  )
                })}
                {members.filter(m => m.status === 'pending').length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="font-inter text-text-secondary text-xs">Pending invites</span>
                    <span className="font-roboto-mono text-text-primary text-sm">
                      {members.filter(m => m.status === 'pending').length}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity Feed (from tx history) */}
            {txHistory.length > 0 && (
              <motion.div variants={fadeUp} className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border-subtle">
                  <h2 className="font-space-grotesk text-text-primary font-semibold">Recent Activity</h2>
                </div>
                <motion.div variants={stagger} initial="hidden" animate="visible" className="divide-y divide-border-subtle">
                  {txHistory.slice(0, 5).map((tx) => (
                    <motion.div key={tx.id} variants={fadeUp} className="px-5 py-4 flex gap-3 items-start hover:bg-bg-card-hover transition-colors">
                      <div className="flex-shrink-0 mt-1.5">
                        <div className={`w-2 h-2 rounded-full ${ACTION_DOT[tx.action as TxAction] ?? ''}`} />
                      </div>
                      <div>
                        <p className="text-text-primary text-sm font-inter">
                          {shortAddr(tx.wallet_address)} {tx.action === 'deposit' ? 'deposited' : 'redeemed'} {tx.amount_display}
                          {' '}to{' '}<span className="font-semibold">{tx.vault_name}</span>
                        </p>
                        <p className="text-text-tertiary text-xs font-inter mt-1">{timeAgo(tx.created_at)}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {showInviteModal && team && (
        <InviteModal teamId={team.id} onClose={() => setShowInviteModal(false)} />
      )}
    </AppLayout>
  )
}
