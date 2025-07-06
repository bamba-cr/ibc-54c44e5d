
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
  redirectTo = '/login' 
}: AuthGuardProps) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Se requer autenticação mas não está logado
    if (requireAuth && !user) {
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    // Se requer admin mas não é admin
    if (requireAdmin && (!profile || !profile.is_admin)) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Se não requer autenticação mas está logado (para páginas como login)
    if (!requireAuth && user) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
      return;
    }
  }, [user, profile, isLoading, requireAuth, requireAdmin, navigate, location, redirectTo]);

  if (isLoading) {
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
    return <>{children}</>;
  }

  // Para páginas que requerem auth, só renderizar se logado
  if (requireAuth && user) {
    // Se requer admin, verificar se é admin
    if (requireAdmin && (!profile || !profile.is_admin)) {
      return null; // Será redirecionado pelo useEffect
    }
    return <>{children}</>;
  }

  return null;
};
