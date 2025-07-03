import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, PendingUser, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';

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

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await authService.fetchUserProfile(user.id);
        // Ensure all required UserProfile properties are present
        const completeProfile: UserProfile = {
          ...profileData,
          rejection_reason: (profileData as any).rejection_reason || null
        };
        setProfile(completeProfile);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            try {
              const profileData = await authService.fetchUserProfile(session.user.id);
              // Ensure all required UserProfile properties are present
              const completeProfile: UserProfile = {
                ...profileData,
                rejection_reason: (profileData as any).rejection_reason || null
              };
              setProfile(completeProfile);
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const profileData = await authService.fetchUserProfile(session.user.id);
          // Ensure all required UserProfile properties are present
          const completeProfile: UserProfile = {
            ...profileData,
            rejection_reason: (profileData as any).rejection_reason || null
          };
          setProfile(completeProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await authService.signIn(email, password);
    setIsLoading(false);
    return result;
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData?: { username?: string; full_name?: string }
  ) => {
    setIsLoading(true);
    const result = await authService.signUp(email, password, userData);
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
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

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    getPendingUsers: authService.getPendingUsers,
    approveUser: authService.approveUser,
    rejectUser: authService.rejectUser,
    promoteToAdmin: authService.promoteToAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
