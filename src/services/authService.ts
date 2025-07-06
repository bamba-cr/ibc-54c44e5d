
import { supabase } from '@/integrations/supabase/client';
import { User, PendingUser } from '@/types/auth';

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) return null;

    // Use RPC function to get user data since direct table access might not be available
    const { data, error } = await supabase.rpc('get_user_profile', { user_uuid: authUser.id });

    if (error || !data || data.length === 0) return null;

    const userData = data[0];
    return {
      id: userData.id,
      auth_user_id: userData.user_id || authUser.id,
      email: userData.email || authUser.email || '',
      full_name: userData.full_name || '',
      phone: userData.phone || '',
      is_admin: userData.is_admin || false,
      status: userData.status || 'pending',
      rejection_reason: userData.rejection_reason || '',
      created_at: userData.created_at || '',
      updated_at: userData.updated_at || ''
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
