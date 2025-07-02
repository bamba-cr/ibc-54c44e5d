import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: { username?: string; full_name?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getPendingUsers: () => Promise<PendingUser[]>;
  approveUser: (userId: string) => Promise<{ error: any }>;
  rejectUser: (userId: string, reason?: string) => Promise<{ error: any }>;
  promoteToAdmin: (userId: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_uuid: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Ensure rejection_reason is included, defaulting to null if not present
        const profileData = {
          ...data[0],
          rejection_reason: data[0].rejection_reason || null
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { username?: string; full_name?: string }
  ) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPendingUsers = async (): Promise<PendingUser[]> => {
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
  };

  const approveUser = async (userId: string) => {
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
  };

  const rejectUser = async (userId: string, reason?: string) => {
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
  };

  const promoteToAdmin = async (userId: string) => {
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
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    getPendingUsers,
    approveUser,
    rejectUser,
    promoteToAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
