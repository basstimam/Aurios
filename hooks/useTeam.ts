'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase'
import type { Team, TeamMember, TeamRole } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// Fetch team where current wallet is a member
// ─────────────────────────────────────────────────────────────────────────────

export function useTeam() {
  const { address } = useAccount()
  const wallet = address?.toLowerCase()

  return useQuery({
    queryKey: ['team', wallet],
    queryFn: async () => {
      if (!wallet) return null


      // Find team membership for this wallet
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
// Create a new team (wallet becomes admin)
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateTeam() {
  const { address } = useAccount()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const wallet = address?.toLowerCase()
      if (!wallet) throw new Error('Wallet not connected')

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
// Invite a member to the team
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

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          wallet_address: walletAddress.toLowerCase(),
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
