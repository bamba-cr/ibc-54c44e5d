
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const { user, profile, isLoading, signOut } = useAuth();
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

  // Se está logado mas não aprovado
  if (requireAuth && user && profile && profile.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Aguardando Aprovação</CardTitle>
            <CardDescription>
              Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Você receberá um email quando sua conta for aprovada e poderá acessar o sistema.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              Fazer Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se está logado mas foi rejeitado
  if (requireAuth && user && profile && profile.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Sua solicitação de acesso foi negada por um administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Entre em contato com o administrador do sistema para mais informações.
            </p>
            <Button onClick={signOut} variant="outline" className="w-full">
              Fazer Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Para páginas que requerem auth, só renderizar se logado e aprovado
  if (requireAuth && user && profile && profile.status === 'approved') {
    // Se requer admin, verificar se é admin
    if (requireAdmin && !profile.is_admin) {
      return null; // Será redirecionado pelo useEffect
    }
    return <>{children}</>;
  }

  return null;
};
