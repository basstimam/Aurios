'use client'
import { AppLayout } from '@/components'

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

const ACTIVITIES = [
  { icon: '💰', text: 'Alex deposited 5,000 USDC to yoUSD', time: '2 hours ago' },
  { icon: '✅', text: 'Sarah approved deposit request #42', time: '5 hours ago' },
  { icon: '🔄', text: 'Mike redeemed 0.5 ETH from yoETH', time: '1 day ago' },
  { icon: '👤', text: 'Jade Wong joined as Viewer', time: '2 days ago' },
  { icon: '💰', text: 'Alex deposited 10,000 USDC to yoUSD', time: '3 days ago' },
  { icon: '⚙️', text: 'Team policy updated by Alex', time: '1 week ago' },
]

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-[#1A1200] text-[#F59E0B] border border-[#F59E0B]',
  Signer: 'bg-[#0A1628] text-[#3B82F6] border border-[#3B82F6]',
  Viewer: 'bg-[#1A1A1A] text-[#6B7280] border border-[#6B7280]',
}

export default function TeamPage() {
  return (
    <AppLayout>
      <div className="max-w-[1280px] mx-auto px-10 py-10">

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold">Team Management</h1>
            <p className="text-[#9B9081] text-sm font-inter mt-1">Manage your DAO treasury team and permissions</p>
          </div>
          <button
            onClick={() => {}}
            className="border border-[#252838] text-[#9B9081] px-4 py-2 rounded-lg font-inter text-sm hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors"
          >
            + Invite Member
          </button>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-8">

          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">

            {/* Team Members Table */}
            <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1C1D27]">
                <h2 className="font-space-grotesk text-[#F4EFE8] font-semibold">Team Members</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1C1D27]">
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Member</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_MEMBERS.map((member, i) => (
                    <tr key={i} className="border-b border-[#1C1D27] last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#252838] flex items-center justify-center text-xs text-[#F4EFE8] font-bold">
                            {member.initials}
                          </div>
                          <div>
                            <p className="text-[#F4EFE8] text-sm font-inter font-medium">{member.name}</p>
                            <p className="text-[#6B625A] text-xs font-roboto-mono">{member.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded font-inter font-medium ${ROLE_COLORS[member.role]}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-inter ${member.status === 'Active' ? 'text-[#22C55E]' : 'text-[#9B9081]'}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#9B9081] text-sm font-inter">{member.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vault Positions Table */}
            <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1C1D27]">
                <h2 className="font-space-grotesk text-[#F4EFE8] font-semibold">Team Vault Positions</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1C1D27]">
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Vault</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Deposited</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Current Value</th>
                    <th className="text-left px-5 py-3 text-[#9B9081] text-xs font-inter uppercase tracking-wider">Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {VAULT_POSITIONS.map((pos, i) => (
                    <tr key={i} className="border-b border-[#1C1D27] last:border-0">
                      <td className="px-5 py-4 font-space-grotesk text-[#F4EFE8] font-semibold text-sm">{pos.vault}</td>
                      <td className="px-5 py-4 font-roboto-mono text-[#F4EFE8] text-sm">{pos.deposited}</td>
                      <td className="px-5 py-4 font-roboto-mono text-[#F4EFE8] text-sm">{pos.value}</td>
                      <td className="px-5 py-4 font-roboto-mono text-[#22C55E] text-sm">{pos.yield}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-[420px] space-y-6">

            {/* Recent Activity */}
            <div className="bg-[#0D0E15] border border-[#252838] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1C1D27]">
                <h2 className="font-space-grotesk text-[#F4EFE8] font-semibold">Recent Activity</h2>
              </div>
              <div className="divide-y divide-[#1C1D27]">
                {ACTIVITIES.map((activity, i) => (
                  <div key={i} className="px-5 py-4 flex gap-3">
                    <span className="text-lg flex-shrink-0">{activity.icon}</span>
                    <div>
                      <p className="text-[#F4EFE8] text-sm font-inter">{activity.text}</p>
                      <p className="text-[#6B625A] text-xs font-inter mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Policy */}
            <div className="bg-[#0D0E15] border border-[#252838] rounded-xl p-5">
              <h2 className="font-space-grotesk text-[#F4EFE8] font-semibold mb-4">Team Policy</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#1C1D27]">
                  <span className="text-[#9B9081] text-sm font-inter">Approval threshold</span>
                  <span className="font-roboto-mono text-[#F4EFE8] text-sm">2 of 3 signers</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1C1D27]">
                  <span className="text-[#9B9081] text-sm font-inter">Max single deposit</span>
                  <span className="font-roboto-mono text-[#F4EFE8] text-sm">10,000 USDC</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#9B9081] text-sm font-inter">Withdrawal cooldown</span>
                  <span className="font-roboto-mono text-[#F4EFE8] text-sm">24 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
