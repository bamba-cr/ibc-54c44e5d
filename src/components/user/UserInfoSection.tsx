
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/types/auth';
import { User } from '@supabase/supabase-js';

interface UserInfoSectionProps {
  profile: UserProfile;
  user: User;
}

export const UserInfoSection = ({ profile, user }: UserInfoSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Suas informações de perfil no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Nome Completo</label>
            <p className="text-lg font-semibold text-gray-800">
              {profile?.full_name || 'Não informado'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Nome de Usuário</label>
            <p className="text-lg font-semibold text-gray-800">
              {profile?.username || 'Não informado'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-lg font-semibold text-gray-800">
              {profile?.email || user?.email}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Telefone</label>
            <p className="text-lg font-semibold text-gray-800">
              {profile?.phone || 'Não informado'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle>Status da Conta</CardTitle>
          <CardDescription>
            Informações sobre o status da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Status Atual</label>
            <div className="mt-2">
              <Badge className={`px-4 py-2 text-base ${getStatusColor(profile?.status || 'pending')}`}>
                {getStatusText(profile?.status || 'pending')}
              </Badge>
            </div>
          </div>
          
          {profile?.status === 'rejected' && profile?.rejection_reason && (
            <div>
              <label className="text-sm font-medium text-gray-600">Motivo da Rejeição</label>
              <p className="text-sm text-red-600 mt-1 p-3 bg-red-50 rounded-lg border border-red-200">
                {profile.rejection_reason}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-600">Tipo de Conta</label>
            <p className="text-lg font-semibold text-gray-800">
              {profile?.is_admin ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Membro desde</label>
            <p className="text-lg font-semibold text-gray-800">
              {new Date(profile?.created_at || '').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
