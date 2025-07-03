
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  async fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_profile', { user_uuid: userId })
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  },

  async createUserProfile(profile: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    
    return data;
  },

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  },

  async signUp(email: string, password: string, userData?: { username?: string; full_name?: string }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    
    return { error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getPendingUsers() {
    const { data, error } = await supabase.rpc('get_pending_users');
    
    if (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
    
    return data || [];
  },

  async approveUser(userId: string) {
    const { error } = await supabase.rpc('approve_user', { target_user_id: userId });
    return { error };
  },

  async rejectUser(userId: string, reason?: string) {
    const { error } = await supabase.rpc('reject_user', { 
      target_user_id: userId, 
      reason: reason || null 
    });
    return { error };
  },

  async promoteToAdmin(userId: string) {
    const { error } = await supabase.rpc('promote_to_admin', { target_user_id: userId });
    return { error };
  }
};
