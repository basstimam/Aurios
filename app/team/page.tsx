'use client'

import { useAccount } from 'wagmi'
import { motion, type Variants } from 'framer-motion'
import { AppLayout } from '@/components'

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
  visible: { transition: { staggerChildren: 0.06 } },
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: 'Alex Chen', address: '0x7a23...4f91', role: 'Admin', status: 'Active', joined: 'Jan 2026', initials: 'AC' },
  { name: 'Sarah Kim', address: '0x3b67...8c22', role: 'Signer', status: 'Active', joined: 'Jan 2026', initials: 'SK' },
  { name: 'Mike Torres', address: '0xf4e1...2d55', role: 'Signer', status: 'Active', joined: 'Feb 2026', initials: 'MT' },
  { name: 'Jade Wong', address: '0x9c88...1a33', role: 'Viewer', status: 'Pending', joined: 'Feb 2026', initials: 'JW' },
]

const VAULT_POSITIONS = [
  { vault: 'yoUSD', deposited: '50,000 USDC', value: '51,200 USDC', yield: '+1,200 USDC', status: 'Active' },
  { vault: 'yoETH', deposited: '10 WETH', value: '10.52 WETH', yield: '+0.52 WETH', status: 'Active' },
  { vault: 'yoBTC', deposited: '0.5 cbBTC', value: '0.519 cbBTC', yield: '+0.019 cbBTC', status: 'Active' },
]

// Emojis replaced with type-based indicators
type ActivityType = 'deposit' | 'approve' | 'redeem' | 'join' | 'settings'

const ACTIVITIES: { type: ActivityType; text: string; time: string }[] = [
  { type: 'deposit', text: 'Alex deposited 5,000 USDC to yoUSD', time: '2 hours ago' },
  { type: 'approve', text: 'Sarah approved deposit request #42', time: '5 hours ago' },
  { type: 'redeem', text: 'Mike redeemed 0.5 ETH from yoETH', time: '1 day ago' },
  { type: 'join', text: 'Jade Wong joined as Viewer', time: '2 days ago' },
  { type: 'deposit', text: 'Alex deposited 10,000 USDC to yoUSD', time: '3 days ago' },
  { type: 'settings', text: 'Team policy updated by Alex', time: '1 week ago' },
]

const ACTIVITY_DOT_COLOR: Record<ActivityType, string> = {
  deposit: 'bg-accent-amber',
  approve: 'bg-accent-green',
  redeem: 'bg-accent-blue',
  join: 'bg-text-secondary',
  settings: 'bg-text-tertiary',
}

// ── Role Badge ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  Admin:  'bg-amber-500/10 text-amber-500 border border-amber-500/30',
  Signer: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  Viewer: 'bg-border-default/30 text-text-secondary border border-border-default',
}

export default function TeamPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <AppLayout>
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="max-w-[1280px] mx-auto px-10 py-10"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center py-32 gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-bg-card border border-border-default flex items-center justify-center">
              <span className="font-space-grotesk text-text-secondary font-bold text-lg">T</span>
            </div>
            <h2 className="font-space-grotesk text-text-primary text-xl font-bold">Team Management</h2>
            <p className="text-text-secondary font-inter text-sm text-center max-w-xs">
              Connect your wallet to view and manage your DAO treasury team.
            </p>
          </motion.div>
        </motion.div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1280px] mx-auto px-10 py-10"
      >

        {/* Page Header */}
        <motion.div
          variants={fadeUp}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="font-space-grotesk text-text-primary text-2xl font-bold">Team Management</h1>
            <p className="text-text-secondary text-sm font-inter mt-1">Manage your DAO treasury team and permissions</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {}}
            className="border border-border-default text-text-secondary px-4 py-2 rounded-lg font-inter text-sm hover:border-accent-amber hover:text-accent-amber transition-colors"
          >
            + Invite Member
          </motion.button>
        </motion.div>

        {/* 2-column layout */}
        <div className="flex gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">

            {/* Team Members Table */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border-subtle">
                <h2 className="font-space-grotesk text-text-primary font-semibold">Team Members</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <motion.tbody variants={stagger} initial="hidden" animate="visible">
                  {TEAM_MEMBERS.map((member, i) => (
                    <motion.tr
                      key={i}
                      variants={fadeUp}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-xs text-text-primary font-bold">
                            {member.initials}
                          </div>
                          <div>
                            <p className="text-text-primary text-sm font-inter font-medium">{member.name}</p>
                            <p className="text-text-tertiary text-xs font-roboto-mono">{member.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded font-inter font-medium ${ROLE_BADGE[member.role]}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-inter ${member.status === 'Active' ? 'text-accent-green' : 'text-text-secondary'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-text-secondary text-sm font-inter">{member.joined}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>

            {/* Vault Positions Table */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border-subtle">
                <h2 className="font-space-grotesk text-text-primary font-semibold">Team Vault Positions</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Vault</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Deposited</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Current Value</th>
                    <th className="text-left px-5 py-3 text-text-secondary text-xs font-inter uppercase tracking-wider">Yield</th>
                  </tr>
                </thead>
                <motion.tbody variants={stagger} initial="hidden" animate="visible">
                  {VAULT_POSITIONS.map((pos, i) => (
                    <motion.tr
                      key={i}
                      variants={fadeUp}
                      className="border-b border-border-subtle last:border-0 hover:bg-bg-card-hover transition-colors"
                    >
                      <td className="px-5 py-4 font-space-grotesk text-text-primary font-semibold text-sm">{pos.vault}</td>
                      <td className="px-5 py-4 font-roboto-mono text-text-primary text-sm">{pos.deposited}</td>
                      <td className="px-5 py-4 font-roboto-mono text-text-primary text-sm">{pos.value}</td>
                      <td className="px-5 py-4 font-roboto-mono text-accent-green text-sm">{pos.yield}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-[420px] space-y-6">

            {/* Recent Activity */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border-subtle">
                <h2 className="font-space-grotesk text-text-primary font-semibold">Recent Activity</h2>
              </div>
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="divide-y divide-border-subtle"
              >
                {ACTIVITIES.map((activity, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="px-5 py-4 flex gap-3 items-start hover:bg-bg-card-hover transition-colors"
                  >
                    {/* Colored dot instead of emoji */}
                    <div className="flex-shrink-0 mt-1.5">
                      <div className={`w-2 h-2 rounded-full ${ACTIVITY_DOT_COLOR[activity.type]}`} />
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-inter">{activity.text}</p>
                      <p className="text-text-tertiary text-xs font-inter mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Team Policy */}
            <motion.div
              variants={fadeUp}
              className="bg-bg-card border border-border-default rounded-xl p-5"
            >
              <h2 className="font-space-grotesk text-text-primary font-semibold mb-4">Team Policy</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary text-sm font-inter">Approval threshold</span>
                  <span className="font-roboto-mono text-text-primary text-sm">2 of 3 signers</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <span className="text-text-secondary text-sm font-inter">Max single deposit</span>
                  <span className="font-roboto-mono text-text-primary text-sm">10,000 USDC</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-text-secondary text-sm font-inter">Withdrawal cooldown</span>
                  <span className="font-roboto-mono text-text-primary text-sm">24 hours</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  )
}
