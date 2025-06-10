export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          default_tension_cross: number | null
          default_tension_main: number | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          preferred_cross_brand_id: number | null
          preferred_cross_model_id: number | null
          preferred_main_brand_id: number | null
          preferred_main_model_id: number | null
          stringer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          default_tension_cross?: number | null
          default_tension_main?: number | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_cross_brand_id?: number | null
          preferred_cross_model_id?: number | null
          preferred_main_brand_id?: number | null
          preferred_main_model_id?: number | null
          stringer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          default_tension_cross?: number | null
          default_tension_main?: number | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_cross_brand_id?: number | null
          preferred_cross_model_id?: number | null
          preferred_main_brand_id?: number | null
          preferred_main_model_id?: number | null
          stringer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_stringer_id_fkey"
            columns: ["stringer_id"]
            isOneToOne: false
            referencedRelation: "stringers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_preferred_cross_string_brand"
            columns: ["preferred_cross_brand_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "fk_preferred_cross_string_model"
            columns: ["preferred_cross_model_id"]
            isOneToOne: false
            referencedRelation: "string_model"
            referencedColumns: ["model_id"]
          },
          {
            foreignKeyName: "fk_preferred_main_string_brand"
            columns: ["preferred_main_brand_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "fk_preferred_main_string_model"
            columns: ["preferred_main_model_id"]
            isOneToOne: false
            referencedRelation: "string_model"
            referencedColumns: ["model_id"]
          },
        ]
      }
      job_stringing_details: {
        Row: {
          created_at: string
          cross_string_id: number | null
          id: string
          job_id: string
          price: string | null
          racquet_brand_id: number | null
          string_id: number | null
          tension_cross: string | null
          tension_main: string | null
        }
        Insert: {
          created_at?: string
          cross_string_id?: number | null
          id?: string
          job_id: string
          price?: string | null
          racquet_brand_id?: number | null
          string_id?: number | null
          tension_cross?: string | null
          tension_main?: string | null
        }
        Update: {
          created_at?: string
          cross_string_id?: number | null
          id?: string
          job_id?: string
          price?: string | null
          racquet_brand_id?: number | null
          string_id?: number | null
          tension_cross?: string | null
          tension_main?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cross_string_brand"
            columns: ["cross_string_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "fk_job"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_main_string_brand"
            columns: ["string_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "fk_racquet_brand"
            columns: ["racquet_brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string | null
          completed_date: string | null
          created_at: string
          due_date: string | null
          id: string
          job_notes: string | null
          job_status: string | null
          job_type: string | null
          racquet_id: string
          stringer_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          job_notes?: string | null
          job_status?: string | null
          job_type?: string | null
          racquet_id: string
          stringer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          job_notes?: string | null
          job_status?: string | null
          job_type?: string | null
          racquet_id?: string
          stringer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_racquet"
            columns: ["racquet_id"]
            isOneToOne: false
            referencedRelation: "active_racquets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_racquet"
            columns: ["racquet_id"]
            isOneToOne: false
            referencedRelation: "racquets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_racquet_id_fkey"
            columns: ["racquet_id"]
            isOneToOne: false
            referencedRelation: "active_racquets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_racquet_id_fkey"
            columns: ["racquet_id"]
            isOneToOne: false
            referencedRelation: "racquets"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          brand_id: number
          id: number
          name: string
        }
        Insert: {
          brand_id: number
          id: number
          name: string
        }
        Update: {
          brand_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string
          id: string
          role: string | null
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          full_name: string
          id: string
          role?: string | null
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      racquets: {
        Row: {
          balance_point: string | null
          brand_id: number
          client_id: string | null
          created_at: string
          head_size: number | null
          id: string
          is_active: boolean
          last_stringing_date: string | null
          length_cm: number | null
          model_id: number
          notes: string | null
          stiffness_rating: string | null
          string_pattern: string | null
          stringing_notes: string | null
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          balance_point?: string | null
          brand_id: number
          client_id?: string | null
          created_at?: string
          head_size?: number | null
          id?: string
          is_active?: boolean
          last_stringing_date?: string | null
          length_cm?: number | null
          model_id: number
          notes?: string | null
          stiffness_rating?: string | null
          string_pattern?: string | null
          stringing_notes?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          balance_point?: string | null
          brand_id?: number
          client_id?: string | null
          created_at?: string
          head_size?: number | null
          id?: string
          is_active?: boolean
          last_stringing_date?: string | null
          length_cm?: number | null
          model_id?: number
          notes?: string | null
          stiffness_rating?: string | null
          string_pattern?: string | null
          stringing_notes?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "racquets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racquets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racquets_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
      string_brand: {
        Row: {
          created_at: string | null
          string_brand: string
          string_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          string_brand: string
          string_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          string_brand?: string
          string_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      string_inventory: {
        Row: {
          brand: string
          brand_id: number | null
          color: string
          cost_per_set: number
          created_at: string
          gauge: string
          id: string
          length_feet: number
          min_stock_level: number
          model: string
          model_id: number | null
          stock_quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          brand: string
          brand_id?: number | null
          color: string
          cost_per_set: number
          created_at?: string
          gauge: string
          id?: string
          length_feet: number
          min_stock_level?: number
          model: string
          model_id?: number | null
          stock_quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          brand_id?: number | null
          color?: string
          cost_per_set?: number
          created_at?: string
          gauge?: string
          id?: string
          length_feet?: number
          min_stock_level?: number
          model?: string
          model_id?: number | null
          stock_quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_string_brand"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "fk_string_model"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "string_model"
            referencedColumns: ["model_id"]
          },
        ]
      }
      string_model: {
        Row: {
          brand_id: number
          created_at: string | null
          model: string
          model_id: number
          type_id: number
          updated_at: string | null
        }
        Insert: {
          brand_id: number
          created_at?: string | null
          model: string
          model_id: number
          type_id: number
          updated_at?: string | null
        }
        Update: {
          brand_id?: number
          created_at?: string | null
          model?: string
          model_id?: number
          type_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "string_model_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "string_brand"
            referencedColumns: ["string_id"]
          },
          {
            foreignKeyName: "string_model_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "string_type"
            referencedColumns: ["type_id"]
          },
        ]
      }
      string_type: {
        Row: {
          created_at: string | null
          type: string
          type_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          type: string
          type_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          type?: string
          type_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      stringers: {
        Row: {
          address: string | null
          business_hours: Json | null
          created_at: string
          id: string
          is_verified: boolean | null
          logo_url: string | null
          phone_number: string
          pricing: Json | null
          services_offered: string[] | null
          shop_name: string
          stringing_experience: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          created_at?: string
          id: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone_number: string
          pricing?: Json | null
          services_offered?: string[] | null
          shop_name: string
          stringing_experience?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          phone_number?: string
          pricing?: Json | null
          services_offered?: string[] | null
          shop_name?: string
          stringing_experience?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stringers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strings: {
        Row: {
          brand: string
          color: string | null
          created_at: string
          description: string | null
          gauge: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          specifications: Json | null
          stock_quantity: number
          stringer_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          brand: string
          color?: string | null
          created_at?: string
          description?: string | null
          gauge?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          specifications?: Json | null
          stock_quantity?: number
          stringer_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          brand?: string
          color?: string | null
          created_at?: string
          description?: string | null
          gauge?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          specifications?: Json | null
          stock_quantity?: number
          stringer_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strings_stringer_id_fkey"
            columns: ["stringer_id"]
            isOneToOne: false
            referencedRelation: "stringers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_racquets: {
        Row: {
          balance_point: string | null
          brand: string | null
          brand_id: number | null
          client_id: string | null
          created_at: string | null
          head_size: number | null
          id: string | null
          is_active: boolean | null
          last_stringing_date: string | null
          length_cm: number | null
          model: string | null
          model_id: number | null
          notes: string | null
          stiffness_rating: string | null
          string_pattern: string | null
          stringing_notes: string | null
          updated_at: string | null
          weight_grams: number | null
        }
        Relationships: [
          {
            foreignKeyName: "racquets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racquets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "racquets_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_inventory_with_brands: {
        Args: { user_id: string }
        Returns: {
          id: string
          model_id: string
          brand: string
          gauge: string
          color: string
          length_feet: number
          stock_quantity: number
          min_stock_level: number
          cost_per_set: number
          user_id: string
          created_at: string
          updated_at: string
          brand_name: string
          model_name: string
        }[]
      }
      get_next_string_brand_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_next_string_model_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_next_string_type_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_racquet_tension_range: {
        Args: { racquet_id: string }
        Returns: {
          min_tension: number
          max_tension: number
        }[]
      }
    }
    Enums: {
      user_role: "customer" | "stringer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["customer", "stringer", "admin"],
    },
  },
} as const
