export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string
          website?: string
          bio?: string
          is_stringer: boolean
        }
        Insert: {
          id: string
          updated_at?: string
          username: string
          full_name: string
          avatar_url?: string
          website?: string
          bio?: string
          is_stringer?: boolean
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          website?: string
          bio?: string
          is_stringer?: boolean
        }
      }
      stringing_jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          stringer_id: string
          client_id: string
          racquet_id: string
          string_id: string
          tension_main: number
          tension_cross: number
          status: 'pending' | 'in_progress' | 'completed' | 'picked_up'
          notes?: string
          price: number
          completed_at?: string
          picked_up_at?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          stringer_id: string
          client_id: string
          racquet_id: string
          string_id: string
          tension_main: number
          tension_cross: number
          status?: 'pending' | 'in_progress' | 'completed' | 'picked_up'
          notes?: string
          price: number
          completed_at?: string | null
          picked_up_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          stringer_id?: string
          client_id?: string
          racquet_id?: string
          string_id?: string
          tension_main?: number
          tension_cross?: number
          status?: 'pending' | 'in_progress' | 'completed' | 'picked_up'
          notes?: string | null
          price?: number
          completed_at?: string | null
          picked_up_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          full_name: string
          email?: string
          phone?: string
          notes?: string
          default_string_id?: string
          default_tension_main?: number
          default_tension_cross?: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          full_name: string
          email?: string
          phone?: string
          notes?: string
          default_string_id?: string
          default_tension_main?: number
          default_tension_cross?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string
          notes?: string
          default_string_id?: string
          default_tension_main?: number
          default_tension_cross?: number
        }
      }
      racquets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          client_id: string
          brand: string
          model: string
          head_size?: number
          string_pattern?: string
          notes?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          client_id: string
          brand: string
          model: string
          head_size?: number
          string_pattern?: string
          notes?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          client_id?: string
          brand?: string
          model?: string
          head_size?: number
          string_pattern?: string
          notes?: string
        }
      }
      strings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          brand: string
          model: string
          type: 'polyester' | 'nylon' | 'natural_gut' | 'hybrid' | 'other'
          gauge: number
          color?: string
          price_per_reel: number
          price_per_set: number
          notes?: string
          in_stock: boolean
          stock_quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          brand: string
          model: string
          type: 'polyester' | 'nylon' | 'natural_gut' | 'hybrid' | 'other'
          gauge: number
          color?: string
          price_per_reel: number
          price_per_set: number
          notes?: string
          in_stock?: boolean
          stock_quantity?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          brand?: string
          model?: string
          type?: 'polyester' | 'nylon' | 'natural_gut' | 'hybrid' | 'other'
          gauge?: number
          color?: string
          price_per_reel?: number
          price_per_set?: number
          notes?: string
          in_stock?: boolean
          stock_quantity?: number
        }
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
  }
}
