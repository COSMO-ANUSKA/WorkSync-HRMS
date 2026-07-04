export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      orgs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          org_id: string;
          employee_code: string;
          full_name: string;
          role: 'employee' | 'manager' | 'hr' | 'admin';
          department: string | null;
          job_title: string | null;
          phone: string | null;
          address: string | null;
          picture_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          org_id: string;
          employee_code: string;
          full_name: string;
          role?: 'employee' | 'manager' | 'hr' | 'admin';
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          org_id: string;
          employee_id: string;
          work_date: string;
          check_in: string | null;
          check_out: string | null;
          status: 'present' | 'absent' | 'half_day' | 'leave';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['attendance']['Row']> & {
          org_id: string;
          employee_id: string;
          work_date: string;
        };
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
      leave_requests: {
        Row: {
          id: string;
          org_id: string;
          employee_id: string;
          leave_type: 'casual' | 'sick' | 'earned' | 'unpaid';
          start_date: string;
          end_date: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled';
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['leave_requests']['Row']> & {
          org_id: string;
          employee_id: string;
          leave_type: 'casual' | 'sick' | 'earned' | 'unpaid';
          start_date: string;
          end_date: string;
          reason: string;
        };
        Update: Partial<Database['public']['Tables']['leave_requests']['Row']>;
      };
      payroll: {
        Row: {
          id: string;
          org_id: string;
          employee_id: string;
          base_salary: number;
          allowances: number;
          deductions: number;
          currency: string;
          effective_from: string;
          payment_status: 'draft' | 'pending' | 'processed' | 'failed';
          updated_by: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payroll']['Row']> & {
          org_id: string;
          employee_id: string;
        };
        Update: Partial<Database['public']['Tables']['payroll']['Row']>;
      };
      audit_log: {
        Row: {
          id: number;
          org_id: string;
          actor_id: string | null;
          table_name: string;
          record_id: string | null;
          action: string;
          old_data: Json | null;
          new_data: Json | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          org_id: string;
          table_name: string;
          action: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          org_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_profile_role: { Args: Record<string, never>; Returns: 'employee' | 'manager' | 'hr' | 'admin' | null };
      current_profile_org_id: { Args: Record<string, never>; Returns: string | null };
      get_leave_balance: { Args: { p_employee_id: string; p_leave_type: 'casual' | 'sick' | 'earned' | 'unpaid'; p_year: number }; Returns: number };
      get_dashboard_stats: { Args: { p_org_id: string }; Returns: Json };
    };
  };
};
