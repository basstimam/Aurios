'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import type { Team, TeamMember, TeamRole } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Fetch team where current wallet is an ACTIVE member
// ─────────────────────────────────────────────────────────────────────────────

export function useTeam() {
  const { address } = useAccount()
  const wallet = address?.toLowerCase()

  return useQuery({
    queryKey: ['team', wallet],
    queryFn: async () => {
      if (!wallet) return null

      // Find active team membership for this wallet
      const { data: membership, error: mErr } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('wallet_address', wallet)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (mErr || !membership) return null

      // Fetch the team
      const { data: team, error: tErr } = await supabase
        .from('teams')
        .select('*')
        .eq('id', membership.team_id)
        .single()

      if (tErr || !team) return null
      return team as Team
    },
    enabled: !!wallet,
    staleTime: 30_000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch pending invitation for current wallet (if any)
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingInvite {
  memberId: string
  teamId: string
  teamName: string
  role: TeamRole
  invitedBy: string
}

export function usePendingInvite() {
  const { address } = useAccount()
  const wallet = address?.toLowerCase()

  return useQuery({
    queryKey: ['pending-invite', wallet],
    queryFn: async (): Promise<PendingInvite | null> => {
      if (!wallet) return null

      // Find pending membership
      const { data: membership, error: mErr } = await supabase
        .from('team_members')
        .select('id, team_id, role, invited_by')
        .eq('wallet_address', wallet)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle()

      if (mErr || !membership) return null

      // Fetch team name
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', membership.team_id)
        .single()

      return {
        memberId: membership.id,
        teamId: membership.team_id,
        teamName: team?.name ?? 'Unknown Team',
        role: membership.role as TeamRole,
        invitedBy: membership.invited_by ?? '',
      }
    },
    enabled: !!wallet,
    staleTime: 15_000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Respond to invite (accept or decline)
// ─────────────────────────────────────────────────────────────────────────────

export function useRespondInvite() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, accept }: { memberId: string; accept: boolean }) => {
      if (accept) {
        const { error } = await supabase
          .from('team_members')
          .update({ status: 'active' })
          .eq('id', memberId)

        if (error) throw new Error(error.message)
      } else {
        // Decline → remove the row
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', memberId)

        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      qc.invalidateQueries({ queryKey: ['pending-invite'] })
      qc.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Create a new team (wallet becomes admin)
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateTeam() {
  const { address } = useAccount()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const wallet = address?.toLowerCase()
      if (!wallet) throw new Error('Wallet not connected')

      // Check if wallet already in a team (active)
      const { data: existing } = await supabase
        .from('team_members')
        .select('id')
        .eq('wallet_address', wallet)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (existing) throw new Error('You are already in a team')

      // Insert team
      const { data: team, error: tErr } = await supabase
        .from('teams')
        .insert({ name, description: description ?? null, creator_address: wallet })
        .select()
        .single()

      if (tErr || !team) throw new Error(tErr?.message ?? 'Failed to create team')

      // Insert creator as admin member
      const { error: mErr } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          wallet_address: wallet,
          role: 'admin',
          status: 'active',
          invited_by: null,
          display_name: null,
        })

      if (mErr) throw new Error(mErr.message)
      return team as Team
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      qc.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch all members of a team
// ─────────────────────────────────────────────────────────────────────────────

export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return []

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .neq('status', 'removed')
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return (data ?? []) as TeamMember[]
    },
    enabled: !!teamId,
    staleTime: 15_000,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Invite a member to the team (with 1 wallet = 1 team validation)
// ─────────────────────────────────────────────────────────────────────────────

export function useInviteMember() {
  const { address } = useAccount()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      teamId,
      walletAddress,
      role,
      displayName,
    }: {
      teamId: string
      walletAddress: string
      role: TeamRole
      displayName?: string
    }) => {
      const inviter = address?.toLowerCase()
      if (!inviter) throw new Error('Wallet not connected')

      const targetWallet = walletAddress.toLowerCase()

      // Check if wallet is already active in any team
      const { data: existingActive } = await supabase
        .from('team_members')
        .select('id, team_id')
        .eq('wallet_address', targetWallet)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()

      if (existingActive) throw new Error('This wallet is already in a team')

      // Check if wallet already has a pending invite to this team
      const { data: existingPending } = await supabase
        .from('team_members')
        .select('id')
        .eq('wallet_address', targetWallet)
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .limit(1)
        .maybeSingle()

      if (existingPending) throw new Error('This wallet already has a pending invite')

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          wallet_address: targetWallet,
          role,
          status: 'pending',
          invited_by: inviter,
          display_name: displayName ?? null,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as TeamMember
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['team-members', vars.teamId] })
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Update member role or status
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateMember() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      memberId,
      teamId,
      updates,
    }: {
      memberId: string
      teamId: string
      updates: { role?: TeamRole; status?: 'active' | 'pending' | 'removed'; display_name?: string }
    }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as TeamMember
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['team-members', vars.teamId] })
    },
  })
}
