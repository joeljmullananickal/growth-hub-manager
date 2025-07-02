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
      clients: {
        Row: {
          activated_tax_module: boolean | null
          contact_number_1: string
          contact_number_2: string | null
          contact_person_name: string
          country: string
          created_at: string
          currency: string
          discontinue_reason: string | null
          email_id: string | null
          gst_number: string | null
          id: string
          name: string
          no_of_branches: number | null
          onboard_date: string
          place: string | null
          reference: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_tax_module?: boolean | null
          contact_number_1: string
          contact_number_2?: string | null
          contact_person_name: string
          country: string
          created_at?: string
          currency?: string
          discontinue_reason?: string | null
          email_id?: string | null
          gst_number?: string | null
          id?: string
          name: string
          no_of_branches?: number | null
          onboard_date?: string
          place?: string | null
          reference?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_tax_module?: boolean | null
          contact_number_1?: string
          contact_number_2?: string | null
          contact_person_name?: string
          country?: string
          created_at?: string
          currency?: string
          discontinue_reason?: string | null
          email_id?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          no_of_branches?: number | null
          onboard_date?: string
          place?: string | null
          reference?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          contact_number: string
          contact_person: string
          country: string
          created_at: string
          customer_name: string
          id: string
          next_followup_date: string | null
          place: string | null
          reference: string | null
          status: Database["public"]["Enums"]["lead_status"]
          status_remarks: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_number: string
          contact_person: string
          country: string
          created_at?: string
          customer_name: string
          id?: string
          next_followup_date?: string | null
          place?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_remarks?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_number?: string
          contact_person?: string
          country?: string
          created_at?: string
          customer_name?: string
          id?: string
          next_followup_date?: string | null
          place?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          status_remarks?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_followups: {
        Row: {
          client_id: string
          created_at: string
          followup_mode: Database["public"]["Enums"]["followup_mode"]
          followup_remarks: string | null
          followup_status: Database["public"]["Enums"]["followup_status"]
          id: string
          next_followup_date: string | null
          payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          followup_mode: Database["public"]["Enums"]["followup_mode"]
          followup_remarks?: string | null
          followup_status?: Database["public"]["Enums"]["followup_status"]
          id?: string
          next_followup_date?: string | null
          payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          followup_mode?: Database["public"]["Enums"]["followup_mode"]
          followup_remarks?: string | null
          followup_status?: Database["public"]["Enums"]["followup_status"]
          id?: string
          next_followup_date?: string | null
          payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_followups_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          commission: number | null
          created_at: string
          currency: string
          gst_amount: number | null
          id: string
          last_paid_amount: number | null
          last_paid_date: string | null
          need_gst_bill: boolean | null
          next_renewal_date: string | null
          payment_remarks: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          client_id: string
          commission?: number | null
          created_at?: string
          currency?: string
          gst_amount?: number | null
          id?: string
          last_paid_amount?: number | null
          last_paid_date?: string | null
          need_gst_bill?: boolean | null
          next_renewal_date?: string | null
          payment_remarks?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          commission?: number | null
          created_at?: string
          currency?: string
          gst_amount?: number | null
          id?: string
          last_paid_amount?: number | null
          last_paid_date?: string | null
          need_gst_bill?: boolean | null
          next_renewal_date?: string | null
          payment_remarks?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
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
      client_status: "active" | "discontinued" | "hold"
      followup_mode: "phone" | "whatsapp" | "email"
      followup_status: "pending" | "completed" | "scheduled"
      lead_status: "very_hot" | "hot" | "warm" | "remove_close"
      payment_status: "paid" | "unpaid" | "invoiced"
      subscription_plan: "monthly" | "3_month" | "6_month" | "yearly"
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
      client_status: ["active", "discontinued", "hold"],
      followup_mode: ["phone", "whatsapp", "email"],
      followup_status: ["pending", "completed", "scheduled"],
      lead_status: ["very_hot", "hot", "warm", "remove_close"],
      payment_status: ["paid", "unpaid", "invoiced"],
      subscription_plan: ["monthly", "3_month", "6_month", "yearly"],
    },
  },
} as const
