/**
 * Hand-written Supabase database types matching the 0001_init.sql migration.
 *
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/services/supabase/database.types.ts
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cover_image: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cover_image?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cover_image?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          group_id: string;
          title: string;
          amount_minor: number;
          paid_by: string;
          split_type: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          title: string;
          amount_minor: number;
          paid_by: string;
          split_type: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          title?: string;
          amount_minor?: number;
          paid_by?: string;
          split_type?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      expense_participants: {
        Row: {
          expense_id: string;
          user_id: string;
        };
        Insert: {
          expense_id: string;
          user_id: string;
        };
        Update: {
          expense_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      expense_splits: {
        Row: {
          expense_id: string;
          user_id: string;
          owed_minor: number;
        };
        Insert: {
          expense_id: string;
          user_id: string;
          owed_minor: number;
        };
        Update: {
          expense_id?: string;
          user_id?: string;
          owed_minor?: number;
        };
        Relationships: [];
      };
      settlements: {
        Row: {
          id: string;
          group_id: string;
          from_user: string;
          to_user: string;
          amount_minor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          from_user: string;
          to_user: string;
          amount_minor: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          from_user?: string;
          to_user?: string;
          amount_minor?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          owner_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          owner_id: string;
          friend_id: string;
          created_at?: string;
        };
        Update: {
          owner_id?: string;
          friend_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      friend_requests: {
        Row: {
          id: string;
          from_user: string;
          to_user: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          responded_at: string | null;
        };
        Insert: {
          id?: string;
          from_user: string;
          to_user: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          responded_at?: string | null;
        };
        Update: {
          id?: string;
          from_user?: string;
          to_user?: string;
          status?: 'pending' | 'accepted' | 'rejected';
          created_at?: string;
          responded_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_group_member: {
        Args: { gid: string };
        Returns: boolean;
      };
      create_expense: {
        Args: {
          p_group_id: string;
          p_title: string;
          p_amount_minor: number;
          p_paid_by: string;
          p_split_type: string;
          p_category: string | null;
          p_participants: string[];
          p_splits: Record<string, unknown>[];
        };
        Returns: string;
      };
      create_group: {
        Args: {
          p_name: string;
          p_description?: string | null;
          p_cover_image?: string | null;
          p_member_ids?: string[];
        };
        Returns: Database['public']['Tables']['groups']['Row'];
      };
      send_friend_request: {
        Args: { p_to_user: string };
        Returns: Database['public']['Tables']['friend_requests']['Row'];
      };
      accept_friend_request: {
        Args: { p_request_id: string };
        Returns: void;
      };
      reject_friend_request: {
        Args: { p_request_id: string };
        Returns: void;
      };
      remove_friend: {
        Args: { p_friend_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
