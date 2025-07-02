
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, PendingUser } from '@/types/auth';

export const authService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_uuid: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        return {
          ...data[0],
          rejection_reason: (data[0] as any).rejection_reason || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return { error };
    }
  },

  async signUp(
    email: string, 
    password: string, 
    userData?: { username?: string; full_name?: string }
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: userData?.username || '',
            full_name: userData?.full_name || '',
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error };
    }
  },

  async signOut() {
    try {
      await supabase.auth.signOut();
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error };
    }
  },

  async getPendingUsers(): Promise<PendingUser[]> {
    try {
      const { data, error } = await supabase.rpc('get_pending_users');
      
      if (error) {
        console.error('Error fetching pending users:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching pending users:', error);
      return [];
    }
  },

  async approveUser(userId: string) {
    try {
      const { data, error } = await supabase.rpc('approve_user', { 
        target_user_id: userId 
      });
      
      if (error) {
        console.error('Error approving user:', error);
        return { error };
      }
      
      if (!data) {
        return { error: { message: 'Não foi possível aprovar o usuário' } };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error approving user:', error);
      return { error };
    }
  },

  async rejectUser(userId: string, reason?: string) {
    try {
      const { data, error } = await supabase.rpc('reject_user', { 
        target_user_id: userId,
        reason: reason || null
      });
      
      if (error) {
        console.error('Error rejecting user:', error);
        return { error };
      }
      
      if (!data) {
        return { error: { message: 'Não foi possível rejeitar o usuário' } };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error rejecting user:', error);
      return { error };
    }
  },

  async promoteToAdmin(userId: string) {
    try {
      const { data, error } = await supabase.rpc('promote_to_admin', { 
        target_user_id: userId 
      });
      
      if (error) {
        console.error('Error promoting to admin:', error);
        return { error };
      }
      
      if (!data) {
        return { error: { message: 'Não foi possível promover o usuário' } };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error promoting to admin:', error);
      return { error };
    }
  }
};
