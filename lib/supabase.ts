import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Application-level types (narrowed from DB string types)
export type TeamRole     = 'admin' | 'member'
export type MemberStatus = 'active' | 'pending' | 'removed'
export type TxAction     = 'deposit' | 'redeem'
export type TxStatus     = 'pending' | 'confirmed' | 'failed'

export type Team        = Database['public']['Tables']['teams']['Row']
export type TeamMember  = Database['public']['Tables']['team_members']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']

// ─────────────────────────────────────────────────────────────────────────────
// Generated Database types (from Supabase type generator)
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      savings_goals: {
        Row: {
          id: string
          wallet_address: string
          name: string
          vault_key: string
          vault_address: string
          target_usd: number
          monthly_deposit_usd: number
          deadline: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          name: string
          vault_key: string
          vault_address: string
          target_usd: number
          monthly_deposit_usd?: number
          deadline?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          name?: string
          vault_key?: string
          vault_address?: string
          target_usd?: number
          monthly_deposit_usd?: number
          deadline?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'savings_goals_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          invited_by: string | null
          joined_at: string
          role: string
          status: string
          team_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          role: string
          status?: string
          team_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: string
          status?: string
          team_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          creator_address: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          creator_address: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          creator_address?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          action: string
          amount_display: string
          amount_raw: string
          confirmed_at: string | null
          created_at: string
          id: string
          status: string
          team_id: string | null
          tx_hash: string | null
          vault_address: string
          vault_asset_symbol: string
          vault_name: string
          wallet_address: string
        }
        Insert: {
          action: string
          amount_display: string
          amount_raw: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          team_id?: string | null
          tx_hash?: string | null
          vault_address: string
          vault_asset_symbol: string
          vault_name: string
          wallet_address: string
        }
        Update: {
          action?: string
          amount_display?: string
          amount_raw?: string
          confirmed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          team_id?: string | null
          tx_hash?: string | null
          vault_address?: string
          vault_asset_symbol?: string
          vault_name?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
