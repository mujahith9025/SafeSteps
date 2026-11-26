export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          language: string
          title: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kb_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          created_at: string
          id: string
          language: string
          licence_note: string | null
          source_name: string
          source_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          licence_note?: string | null
          source_name: string
          source_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          licence_note?: string | null
          source_name?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          structured: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          structured?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          structured?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          allergies: string[] | null
          conditions: string[] | null
          consent_accepted_at: string | null
          consent_version: string | null
          created_at: string
          full_name: string | null
          height_cm: number | null
          id: string
          medicines: string[] | null
          personalise: boolean | null
          preferred_language: string | null
          pregnant: boolean | null
          sex: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[] | null
          conditions?: string[] | null
          consent_accepted_at?: string | null
          consent_version?: string | null
          created_at?: string
          full_name?: string | null
          height_cm?: number | null
          id: string
          medicines?: string[] | null
          personalise?: boolean | null
          preferred_language?: string | null
          pregnant?: boolean | null
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[] | null
          conditions?: string[] | null
          consent_accepted_at?: string | null
          consent_version?: string | null
          created_at?: string
          full_name?: string | null
          height_cm?: number | null
          id?: string
          medicines?: string[] | null
          personalise?: boolean | null
          preferred_language?: string | null
          pregnant?: boolean | null
          sex?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      report_values: {
        Row: {
          corrected_by_user: boolean
          created_at: string
          explanation: string | null
          id: string
          reference_high: number | null
          reference_low: number | null
          report_id: string
          status: string
          test_name: string
          unit: string | null
          user_id: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          corrected_by_user?: boolean
          created_at?: string
          explanation?: string | null
          id?: string
          reference_high?: number | null
          reference_low?: number | null
          report_id: string
          status: string
          test_name: string
          unit?: string | null
          user_id: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          corrected_by_user?: boolean
          created_at?: string
          explanation?: string | null
          id?: string
          reference_high?: number | null
          reference_low?: number | null
          report_id?: string
          status?: string
          test_name?: string
          unit?: string | null
          user_id?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_values_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          raw_text_deleted_at: string | null
          source_type: string
          summary: Json | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          raw_text_deleted_at?: string | null
          source_type: string
          summary?: Json | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          raw_text_deleted_at?: string | null
          source_type?: string
          summary?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_kb_chunks: {
        Args: {
          language_filter?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          content: string
          document_id: string
          document_title: string
          id: string
          language: string
          metadata: Json
          similarity: number
          source_name: string
          source_url: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// -----------------------------------------------------------------------------
// Convenience Model Type Aliases
// -----------------------------------------------------------------------------
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type DbMessage = Database['public']['Tables']['messages']['Row']
export type DbMessageInsert = Database['public']['Tables']['messages']['Insert']
export type DbMessageUpdate = Database['public']['Tables']['messages']['Update']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type ReportValue = Database['public']['Tables']['report_values']['Row']
export type ReportValueInsert = Database['public']['Tables']['report_values']['Insert']
export type ReportValueUpdate = Database['public']['Tables']['report_values']['Update']

export type KbDocument = Database['public']['Tables']['kb_documents']['Row']
export type KbDocumentInsert = Database['public']['Tables']['kb_documents']['Insert']
export type KbDocumentUpdate = Database['public']['Tables']['kb_documents']['Update']

export type KbChunk = Database['public']['Tables']['kb_chunks']['Row']
export type KbChunkInsert = Database['public']['Tables']['kb_chunks']['Insert']
export type KbChunkUpdate = Database['public']['Tables']['kb_chunks']['Update']

export type AuditLogEntry = Database['public']['Tables']['audit_log']['Row']
export type AuditLogEntryInsert = Database['public']['Tables']['audit_log']['Insert']

export type KbMatchResult = Database['public']['Functions']['match_kb_chunks']['Returns'][number]
