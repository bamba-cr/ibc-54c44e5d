
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

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
  const { user, profile, isLoading } = useAuth();
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
    if (!requireAuth && user) {
      const from = location.state?.from || '/dashboard';
      console.log('AuthGuard - no auth required but user logged in, redirecting to:', from);
      navigate(from, { replace: true });
      return;
    }
  }, [user, profile, isLoading, requireAuth, requireAdmin, navigate, location, redirectTo]);

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

  // Para páginas que não requerem auth, sempre renderizar
  if (!requireAuth) {
    console.log('AuthGuard - no auth required, rendering children');
    return <>{children}</>;
  }

  // Para páginas que requerem auth, só renderizar se logado
  if (requireAuth && user) {
    // Se requer admin, verificar se é admin
    if (requireAdmin && (!profile || !profile.is_admin)) {
      console.log('AuthGuard - admin required but user is not admin, returning null');
      return null; // Será redirecionado pelo useEffect
    }
    console.log('AuthGuard - auth requirements met, rendering children');
    return <>{children}</>;
  }

  console.log('AuthGuard - conditions not met, returning null');
  return null;
};
