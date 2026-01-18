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
      court_favorites: {
        Row: {
          id: string
          user_id: string
          court_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          court_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          court_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_favorites_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          }
        ]
      }
      court_feedback: {
        Row: {
          id: string
          court_id: string
          user_id: string
          type: 'correction' | 'review' | 'comment'
          correction_type: 'wrong_info' | 'no_pickleball' | 'closed' | 'other' | null
          correction_details: string | null
          rating: number | null
          content: string | null
          status: 'active' | 'hidden' | 'resolved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          user_id: string
          type: 'correction' | 'review' | 'comment'
          correction_type?: 'wrong_info' | 'no_pickleball' | 'closed' | 'other' | null
          correction_details?: string | null
          rating?: number | null
          content?: string | null
          status?: 'active' | 'hidden' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          user_id?: string
          type?: 'correction' | 'review' | 'comment'
          correction_type?: 'wrong_info' | 'no_pickleball' | 'closed' | 'other' | null
          correction_details?: string | null
          rating?: number | null
          content?: string | null
          status?: 'active' | 'hidden' | 'resolved'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_feedback_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      court_photos: {
        Row: {
          id: string
          court_id: string
          user_id: string
          url: string
          caption: string | null
          status: 'active' | 'hidden'
          created_at: string
        }
        Insert: {
          id?: string
          court_id: string
          user_id: string
          url: string
          caption?: string | null
          status?: 'active' | 'hidden'
          created_at?: string
        }
        Update: {
          id?: string
          court_id?: string
          user_id?: string
          url?: string
          caption?: string | null
          status?: 'active' | 'hidden'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "court_photos_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "court_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      court_submissions: {
        Row: {
          address: string | null
          approved_court_id: string | null
          courts_count: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          price: string | null
          region: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: string
          suburb: string
          surface: string | null
          type: string | null
          venue_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          approved_court_id?: string | null
          courts_count?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          price?: string | null
          region?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          suburb: string
          surface?: string | null
          type?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          approved_court_id?: string | null
          courts_count?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: string | null
          region?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          suburb?: string
          surface?: string | null
          type?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "court_submissions_approved_court_id_fkey"
            columns: ["approved_court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          email_preferences: {
            submission_reviewed: boolean
            replies: boolean
            weekly_digest: boolean
          } | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          email_preferences?: {
            submission_reviewed: boolean
            replies: boolean
            weekly_digest: boolean
          } | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          email_preferences?: {
            submission_reviewed: boolean
            replies: boolean
            weekly_digest: boolean
          } | null
          created_at?: string
        }
        Relationships: []
      }
      courts: {
        Row: {
          address: string | null
          courts_count: string | null
          created_at: string | null
          enriched_at: string | null
          enrichment_status: string | null
          features: string[] | null
          google_formatted_address: string | null
          google_opening_hours: Json | null
          google_phone: string | null
          google_photos: Json | null
          google_place_id: string | null
          google_price_level: string | null
          google_rating: number | null
          google_user_ratings_total: number | null
          google_website: string | null
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
          enriched_at?: string | null
          enrichment_status?: string | null
          features?: string[] | null
          google_formatted_address?: string | null
          google_opening_hours?: Json | null
          google_phone?: string | null
          google_photos?: Json | null
          google_place_id?: string | null
          google_price_level?: string | null
          google_rating?: number | null
          google_user_ratings_total?: number | null
          google_website?: string | null
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
          enriched_at?: string | null
          enrichment_status?: string | null
          features?: string[] | null
          google_formatted_address?: string | null
          google_opening_hours?: Json | null
          google_phone?: string | null
          google_photos?: Json | null
          google_place_id?: string | null
          google_price_level?: string | null
          google_rating?: number | null
          google_user_ratings_total?: number | null
          google_website?: string | null
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

export type CourtSubmission = Database["public"]["Tables"]["court_submissions"]["Row"]
export type CourtSubmissionInsert = Database["public"]["Tables"]["court_submissions"]["Insert"]
export type CourtSubmissionUpdate = Database["public"]["Tables"]["court_submissions"]["Update"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type CourtFeedback = Database["public"]["Tables"]["court_feedback"]["Row"]
export type CourtFeedbackInsert = Database["public"]["Tables"]["court_feedback"]["Insert"]
export type CourtFeedbackUpdate = Database["public"]["Tables"]["court_feedback"]["Update"]

export type CourtPhoto = Database["public"]["Tables"]["court_photos"]["Row"]
export type CourtPhotoInsert = Database["public"]["Tables"]["court_photos"]["Insert"]
export type CourtPhotoUpdate = Database["public"]["Tables"]["court_photos"]["Update"]

export type CourtFavorite = Database["public"]["Tables"]["court_favorites"]["Row"]
export type CourtFavoriteInsert = Database["public"]["Tables"]["court_favorites"]["Insert"]
export type CourtFavoriteUpdate = Database["public"]["Tables"]["court_favorites"]["Update"]
