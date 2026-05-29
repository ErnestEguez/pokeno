// Tipos TypeScript del schema de Pokeno, compatibles con @supabase/supabase-js v2

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type RoomStatus = 'lobby' | 'playing' | 'paused' | 'finished'
export type DeckStatus = 'ready' | 'running' | 'paused' | 'done'

// Alias para el array vacío de relaciones requerido por GenericTable
type NoRelationships = []

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          is_admin: boolean
          is_enabled: boolean
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          is_admin?: boolean
          is_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          is_admin?: boolean
          is_enabled?: boolean
          created_at?: string
        }
        Relationships: NoRelationships
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          games_total: number
          games_used: number
          max_boards_per_game: number
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          games_total?: number
          games_used?: number
          max_boards_per_game?: number
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          games_total?: number
          games_used?: number
          max_boards_per_game?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: NoRelationships
      }
      board_templates: {
        Row: {
          id: string
          board_number: number
          display_name: string
          card_grid: string[][]
          created_at: string
        }
        Insert: {
          id?: string
          board_number: number
          display_name: string
          card_grid: string[][]
          created_at?: string
        }
        Update: {
          id?: string
          board_number?: number
          display_name?: string
          card_grid?: string[][]
          created_at?: string
        }
        Relationships: NoRelationships
      }
      rooms: {
        Row: {
          id: string
          owner_id: string
          host_id: string | null
          name: string
          status: RoomStatus
          winning_patterns: string[]
          max_boards: number
          invite_code: string
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          host_id?: string | null
          name: string
          status?: RoomStatus
          winning_patterns?: string[]
          max_boards?: number
          invite_code?: string
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          host_id?: string
          name?: string
          status?: RoomStatus
          winning_patterns?: string[]
          max_boards?: number
          invite_code?: string
          created_at?: string
          ended_at?: string | null
        }
        Relationships: NoRelationships
      }
      room_slots: {
        Row: {
          id: string
          room_id: string
          board_template_id: string
          slot_label: string | null
          position: number | null
          claimed_at: string
        }
        Insert: {
          id?: string
          room_id: string
          board_template_id: string
          slot_label?: string | null
          position?: number | null
          claimed_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          board_template_id?: string
          slot_label?: string | null
          position?: number | null
          claimed_at?: string
        }
        Relationships: NoRelationships
      }
      room_decks: {
        Row: {
          id: string
          room_id: string
          shuffled_deck: string[]
          current_index: number
          deck_status: DeckStatus
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          shuffled_deck: string[]
          current_index?: number
          deck_status?: DeckStatus
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          shuffled_deck?: string[]
          current_index?: number
          deck_status?: DeckStatus
          updated_at?: string
        }
        Relationships: NoRelationships
      }
      called_cards: {
        Row: {
          id: string
          room_id: string
          card_code: string
          call_order: number
          called_at: string
        }
        Insert: {
          id?: string
          room_id: string
          card_code: string
          call_order: number
          called_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          card_code?: string
          call_order?: number
          called_at?: string
        }
        Relationships: NoRelationships
      }
      marked_cells: {
        Row: {
          id: string
          slot_id: string
          card_code: string
          is_marked: boolean
        }
        Insert: {
          id?: string
          slot_id: string
          card_code: string
          is_marked?: boolean
        }
        Update: {
          id?: string
          slot_id?: string
          card_code?: string
          is_marked?: boolean
        }
        Relationships: NoRelationships
      }
      host_log: {
        Row: {
          id: string
          room_id: string
          user_id: string
          action: string
          occurred_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          action: string
          occurred_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          action?: string
          occurred_at?: string
        }
        Relationships: NoRelationships
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Tipos de fila para uso en componentes y API routes
export type UserRow         = Database['public']['Tables']['users']['Row']
export type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row']
export type BoardTemplateRow = Database['public']['Tables']['board_templates']['Row']
export type RoomRow         = Database['public']['Tables']['rooms']['Row']
export type RoomSlotRow     = Database['public']['Tables']['room_slots']['Row']
export type RoomDeckRow     = Database['public']['Tables']['room_decks']['Row']
export type CalledCardRow   = Database['public']['Tables']['called_cards']['Row']
export type MarkedCellRow   = Database['public']['Tables']['marked_cells']['Row']
export type HostLogRow      = Database['public']['Tables']['host_log']['Row']
