
import { supabase } from '@/integrations/supabase/client';
import { User, PendingUser } from '@/types/auth';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    // Query the users table directly instead of using RPC for better data access
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      auth_user_id: data.auth_user_id || authUser.id,
      email: data.email || authUser.email || '',
      full_name: data.full_name || '',
      phone: data.phone || '',
      is_admin: data.is_admin || false,
      status: data.status || 'pending',
      rejection_reason: data.rejection_reason || '',
      created_at: data.created_at || '',
      updated_at: data.updated_at || ''
    } as User;
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  },

  async signUp(email: string, password: string, fullName: string, phone?: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    return { error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    return { error };
  },

  async getPendingUsers(): Promise<PendingUser[]> {
    const { data, error } = await supabase.rpc('get_pending_users');
    
    if (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
    
    return data || [];
  },

  async approveUser(userId: string) {
    const { data, error } = await supabase.rpc('approve_user', { 
      target_user_id: userId 
    });
    
    return { error, success: data };
  },

  async rejectUser(userId: string, reason?: string) {
    const { data, error } = await supabase.rpc('reject_user', { 
      target_user_id: userId,
      reason: reason || null
    });
    
    return { error, success: data };
  },

  async promoteToAdmin(userId: string) {
    const { data, error } = await supabase.rpc('promote_to_admin', { 
      target_user_id: userId 
    });
    
    return { error, success: data };
  }
};
