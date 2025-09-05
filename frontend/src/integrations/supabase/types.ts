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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          created_at: string
          description: string | null
          difficulty: number | null
          ge_categories: string[]
          id: string
          offered: string[]
          tags: string[]
          title: string
          units: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: number | null
          ge_categories?: string[]
          id: string
          offered?: string[]
          tags?: string[]
          title: string
          units: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: number | null
          ge_categories?: string[]
          id?: string
          offered?: string[]
          tags?: string[]
          title?: string
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      generated_schedules: {
        Row: {
          courses: Json
          created_at: string
          id: string
          is_active: boolean
          preferences: Json
          quarter: string
          score: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          courses?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          preferences?: Json
          quarter: string
          score?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          courses?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          preferences?: Json
          quarter?: string
          score?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_goals: {
        Row: {
          created_at: string
          goal_name: string
          id: string
          monthly_contribution: number
          progress: number | null
          status: string | null
          target_amount: number
          target_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_name: string
          id?: string
          monthly_contribution: number
          progress?: number | null
          status?: string | null
          target_amount: number
          target_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_name?: string
          id?: string
          monthly_contribution?: number
          progress?: number | null
          status?: string | null
          target_amount?: number
          target_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          anonymous_name: string
          created_at: string
          id: string
          portfolio_id: string
          simulated_return: number
          timeframe: string
          user_id: string
        }
        Insert: {
          anonymous_name: string
          created_at?: string
          id?: string
          portfolio_id: string
          simulated_return: number
          timeframe: string
          user_id: string
        }
        Update: {
          anonymous_name?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          simulated_return?: number
          timeframe?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      major_requirements: {
        Row: {
          category: string | null
          course_id: string
          created_at: string
          id: string
          major_id: string
          requirement_type: string
        }
        Insert: {
          category?: string | null
          course_id: string
          created_at?: string
          id?: string
          major_id: string
          requirement_type?: string
        }
        Update: {
          category?: string | null
          course_id?: string
          created_at?: string
          id?: string
          major_id?: string
          requirement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "major_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "major_requirements_major_id_fkey"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      majors: {
        Row: {
          created_at: string
          description: string | null
          ge_requirements: Json
          id: string
          name: string
          total_units: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ge_requirements?: Json
          id: string
          name: string
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ge_requirements?: Json
          id?: string
          name?: string
          total_units?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          allocation: Json
          created_at: string
          esg_preference: boolean | null
          expected_return: number
          id: string
          investment_goal: string
          monthly_budget: number
          name: string
          projected_value: number
          risk_score: number
          risk_tolerance: string
          time_horizon: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation: Json
          created_at?: string
          esg_preference?: boolean | null
          expected_return: number
          id?: string
          investment_goal: string
          monthly_budget: number
          name?: string
          projected_value: number
          risk_score: number
          risk_tolerance: string
          time_horizon: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation?: Json
          created_at?: string
          esg_preference?: boolean | null
          expected_return?: number
          id?: string
          investment_goal?: string
          monthly_budget?: number
          name?: string
          projected_value?: number
          risk_score?: number
          risk_tolerance?: string
          time_horizon?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prerequisites: {
        Row: {
          course_id: string
          created_at: string
          id: string
          prereq_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          prereq_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          prereq_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prerequisites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prerequisites_prereq_id_fkey"
            columns: ["prereq_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_year: string | null
          created_at: string
          display_name: string | null
          email: string | null
          graduation_goal: string | null
          id: string
          investor_level: string | null
          major_id: string | null
          portfolios_created: number | null
          preferences: Json | null
          total_simulated_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_goal?: string | null
          id?: string
          investor_level?: string | null
          major_id?: string | null
          portfolios_created?: number | null
          preferences?: Json | null
          total_simulated_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_goal?: string | null
          id?: string
          investor_level?: string | null
          major_id?: string | null
          portfolios_created?: number | null
          preferences?: Json | null
          total_simulated_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_major"
            columns: ["major_id"]
            isOneToOne: false
            referencedRelation: "majors"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          calculated_risk_tolerance: string
          created_at: string
          id: string
          responses: Json
          score: number
          user_id: string
        }
        Insert: {
          calculated_risk_tolerance: string
          created_at?: string
          id?: string
          responses: Json
          score: number
          user_id: string
        }
        Update: {
          calculated_risk_tolerance?: string
          created_at?: string
          id?: string
          responses?: Json
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      student_courses: {
        Row: {
          course_id: string
          created_at: string
          grade: string | null
          id: string
          quarter: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          grade?: string | null
          id?: string
          quarter?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          grade?: string | null
          id?: string
          quarter?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
