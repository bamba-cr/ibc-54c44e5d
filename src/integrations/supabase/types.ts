export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          observations: string | null
          project_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          observations?: string | null
          project_id: string
          status: string
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          observations?: string | null
          project_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          additional_data: Json | null
          created_at: string | null
          error_type: Database["public"]["Enums"]["error_type"]
          id: string
          message: string
          resolution_notes: string | null
          resolved: boolean | null
          route: string | null
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          additional_data?: Json | null
          created_at?: string | null
          error_type: Database["public"]["Enums"]["error_type"]
          id?: string
          message: string
          resolution_notes?: string | null
          resolved?: boolean | null
          route?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          additional_data?: Json | null
          created_at?: string | null
          error_type?: Database["public"]["Enums"]["error_type"]
          id?: string
          message?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          route?: string | null
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string
          grade: number | null
          id: string
          observations: string | null
          period: string
          project_id: string | null
          student_id: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          grade?: number | null
          id?: string
          observations?: string | null
          period: string
          project_id?: string | null
          student_id?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          grade?: number | null
          id?: string
          observations?: string | null
          period?: string
          project_id?: string | null
          student_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          last_login_at: string | null
          phone: string | null
          rejection_reason: string | null
          role_id: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          rejection_reason?: string | null
          role_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          rejection_reason?: string | null
          role_id?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["permission_type"]
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["permission_type"]
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["permission_type"]
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_projects: {
        Row: {
          project_id: string
          student_id: string
        }
        Insert: {
          project_id: string
          student_id: string
        }
        Update: {
          project_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string
          age: number | null
          birth_date: string
          city: string
          cpf: string | null
          created_at: string
          guardian_cpf: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          guardian_rg: string | null
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          rg: string | null
        }
        Insert: {
          address: string
          age?: number | null
          birth_date: string
          city: string
          cpf?: string | null
          created_at?: string
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          guardian_rg?: string | null
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          rg?: string | null
        }
        Update: {
          address?: string
          age?: number | null
          birth_date?: string
          city?: string
          cpf?: string | null
          created_at?: string
          guardian_cpf?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          guardian_rg?: string | null
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          rg?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          token_hash: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          last_used_at?: string | null
          token_hash: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          token_hash?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      student_performance: {
        Row: {
          attendance_rate: number | null
          average_grade: number | null
          project_id: string | null
          project_name: string | null
          student_id: string | null
          student_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_initial_admin: {
        Args: { admin_email: string }
        Returns: boolean
      }
      create_user_by_admin: {
        Args: {
          email_param: string
          password_param: string
          full_name_param: string
          role_id_param: string
        }
        Returns: Json
      }
      find_user_by_identifier: {
        Args: { identifier: string }
        Returns: {
          user_id: string
          email: string
          username: string
        }[]
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          username: string
          role_id: string
          created_at: string
        }[]
      }
      get_error_logs_with_details: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          user_email: string
          error_type: Database["public"]["Enums"]["error_type"]
          message: string
          stack_trace: string
          additional_data: Json
          route: string
          created_at: string
          resolved: boolean
          resolution_notes: string
        }[]
      }
      get_pending_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          email: string
          username: string
          full_name: string
          created_at: string
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      get_project_rankings: {
        Args: { project_id_param: string }
        Returns: {
          student_id: string
          student_name: string
          average_grade: number
          attendance_rate: number
          grade_rank: number
          attendance_rank: number
        }[]
      }
      get_user_events: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          title: string
          date: string
          description: string
          type: string
          created_at: string
        }[]
      }
      get_user_permissions: {
        Args: { user_uuid?: string }
        Returns: {
          permission: Database["public"]["Enums"]["permission_type"]
        }[]
      }
      get_user_profile: {
        Args: { user_uuid?: string }
        Returns: {
          id: string
          user_id: string
          email: string
          username: string
          full_name: string
          avatar_url: string
          phone: string
          is_admin: boolean
          status: Database["public"]["Enums"]["user_status"]
          created_at: string
          updated_at: string
        }[]
      }
      has_permission: {
        Args: {
          user_uuid: string
          permission_name: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_user_approved: {
        Args: { user_id?: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      reject_user: {
        Args: { target_user_id: string; reason?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      error_type: "api" | "frontend" | "backend" | "database" | "auth" | "other"
      permission_type:
        | "read_students"
        | "write_students"
        | "delete_students"
        | "read_projects"
        | "write_projects"
        | "delete_projects"
        | "read_attendance"
        | "write_attendance"
        | "read_grades"
        | "write_grades"
        | "read_reports"
        | "manage_users"
        | "manage_roles"
        | "admin_access"
      user_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      error_type: ["api", "frontend", "backend", "database", "auth", "other"],
      permission_type: [
        "read_students",
        "write_students",
        "delete_students",
        "read_projects",
        "write_projects",
        "delete_projects",
        "read_attendance",
        "write_attendance",
        "read_grades",
        "write_grades",
        "read_reports",
        "manage_users",
        "manage_roles",
        "admin_access",
      ],
      user_status: ["pending", "approved", "rejected"],
    },
  },
} as const
