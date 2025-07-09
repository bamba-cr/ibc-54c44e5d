import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
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
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_uuid: userId });
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      console.log('Profile data received:', data);
      if (data && data.length > 0) {
        // Cast para incluir rejection_reason que pode não estar nos tipos gerados ainda
        const profileData = data[0] as any;
        const userProfile: UserProfile = {
          id: profileData.id,
          user_id: profileData.user_id,
          email: profileData.email,
          username: profileData.username,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          phone: profileData.phone,
          is_admin: profileData.is_admin,
          status: profileData.status,
          rejection_reason: profileData.rejection_reason || null,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        };
        setProfile(userProfile);
        console.log('Profile set - is_admin:', userProfile.is_admin, 'status:', userProfile.status);
        
        // Verificar se o usuário está pendente ou rejeitado
        if (userProfile.status === 'pending') {
          toast({
            title: "Conta pendente de aprovação",
            description: "Sua conta está aguardando aprovação de um administrador.",
            variant: "default",
          });
        } else if (userProfile.status === 'rejected') {
          toast({
            title: "Conta rejeitada",
            description: userProfile.rejection_reason || "Sua conta foi rejeitada por um administrador.",
            variant: "destructive",
          });
          // Deslogar o usuário se a conta foi rejeitada
          await supabase.auth.signOut();
          return;
        }
      } else {
        console.log('No profile data found');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile...');
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Buscar perfil do usuário se estiver logado
        if (session?.user) {
          // Pequeno delay para garantir que as mudanças no banco foram processadas
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 200);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error };
      }

      console.log('Sign in successful');
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
      console.log('Attempting sign up for:', email);
      
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

      console.log('Sign up successful');
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
      console.log('Signing out...');
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      console.log('Sign out successful');
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

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
