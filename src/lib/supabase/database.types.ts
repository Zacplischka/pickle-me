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
      courts: {
        Row: {
          address: string | null
          courts_count: string | null
          created_at: string | null
          features: string[] | null
          id: string
          image_url: string | null
          lat: number | null
          line_marking: string | null
          lng: number | null
          name: string
          notes: string | null
          price: string | null
          region: string | null
          suburb: string
          surface: string | null
          type: string | null
          updated_at: string | null
          venue_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          courts_count?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          lat?: number | null
          line_marking?: string | null
          lng?: number | null
          name: string
          notes?: string | null
          price?: string | null
          region?: string | null
          suburb: string
          surface?: string | null
          type?: string | null
          updated_at?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          courts_count?: string | null
          created_at?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          lat?: number | null
          line_marking?: string | null
          lng?: number | null
          name?: string
          notes?: string | null
          price?: string | null
          region?: string | null
          suburb?: string
          surface?: string | null
          type?: string | null
          updated_at?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Relationships: []
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

export type Court = Database["public"]["Tables"]["courts"]["Row"]
export type CourtInsert = Database["public"]["Tables"]["courts"]["Insert"]
export type CourtUpdate = Database["public"]["Tables"]["courts"]["Update"]
