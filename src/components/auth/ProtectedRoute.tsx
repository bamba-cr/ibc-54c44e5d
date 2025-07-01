
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Shield, Clock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
        return;
      }

      if (profile && profile.status !== 'approved') {
        toast({
          title: "Acesso Negado",
          description: "Sua conta ainda não foi aprovada pelo administrador.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      if (requireAdmin && profile && !profile.is_admin) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive",
        });
        navigate('/relatorios');
        return;
      }
    }
  }, [user, profile, isLoading, navigate, toast, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando acesso...</h2>
          <p className="text-gray-600">Aguarde enquanto validamos suas credenciais</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (profile && profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Aguardando Aprovação</h2>
          <p className="text-gray-600 mb-6">
            Sua conta foi criada com sucesso, mas ainda está aguardando aprovação do administrador.
            Você receberá um email quando sua conta for aprovada.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              <strong>Status:</strong> Pendente de aprovação
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profile && profile.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Sua solicitação de acesso foi rejeitada pelo administrador.
          </p>
          {profile.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <strong>Motivo:</strong> {profile.rejection_reason}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador para mais informações.
          </p>
        </motion.div>
      </div>
    );
  }

  if (requireAdmin && profile && !profile.is_admin) {
    return null;
  }

  return <>{children}</>;
};
