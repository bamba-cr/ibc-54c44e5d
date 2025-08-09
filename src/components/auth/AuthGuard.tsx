
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/auth' 
}: AuthGuardProps) => {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthGuard - user:', user, 'profile:', profile, 'isLoading:', isLoading, 'requireAdmin:', requireAdmin);
    
    if (isLoading) {
      console.log('AuthGuard - still loading, waiting...');
      return;
    }

    // Se requer autenticação mas não está logado
    if (requireAuth && !user) {
      console.log('AuthGuard - auth required but no user, redirecting to:', redirectTo);
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Se requer admin mas não é admin
    if (requireAdmin && (!profile || !profile.is_admin)) {
      console.log('AuthGuard - admin required but user is not admin, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Se não requer autenticação mas está logado (para páginas como login)
    if (!requireAuth && user && profile?.status === 'approved') {
      const from = location.state?.from || '/dashboard';
      console.log('AuthGuard - no auth required but user logged in and approved, redirecting to:', from);
      navigate(from, { replace: true });
      return;
    }
  }, [user, profile, isLoading, requireAuth, requireAdmin, navigate, location, redirectTo]);

  useEffect(() => {
    if (requireAuth && user && !profile && !isLoading) {
      console.log('AuthGuard - profile missing, attempting refresh');
      refreshProfile();
    }
  }, [requireAuth, user, profile, isLoading, refreshProfile]);

  if (isLoading) {
    console.log('AuthGuard - rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se está logado mas o perfil ainda não foi carregado, mostrar loading
  if (requireAuth && user && !profile) {
    console.log('AuthGuard - user logged in but profile not loaded yet, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Para páginas que não requerem auth, sempre renderizar
  if (!requireAuth) {
    console.log('AuthGuard - no auth required, rendering children');
    return <>{children}</>;
  }

  // Para páginas que requerem auth, só renderizar se logado e aprovado
  if (requireAuth && user && profile) {
    // Verificar se o usuário está aprovado
    if (profile.status === 'pending') {
      console.log('AuthGuard - user pending approval');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua conta está aguardando aprovação de um administrador. Você será notificado quando sua conta for aprovada.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    if (profile.status === 'rejected') {
      console.log('AuthGuard - user account rejected');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Alert className="max-w-md" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua conta foi rejeitada. {profile.rejection_reason || 'Entre em contato com o administrador para mais informações.'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    // Se requer admin, verificar se é admin
    if (requireAdmin && !profile.is_admin) {
      console.log('AuthGuard - admin required but user is not admin, returning null');
      return null; // Será redirecionado pelo useEffect
    }

    console.log('AuthGuard - auth requirements met, rendering children');
    return <>{children}</>;
  }

  console.log('AuthGuard - conditions not met, returning null');
  return null;
};
