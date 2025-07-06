
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';
import { Mail, Phone, User as UserIcon, Calendar } from 'lucide-react';

interface UserInfoSectionProps {
  user: User;
}

export const UserInfoSection = ({ user }: UserInfoSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserIcon className="h-5 w-5" />
          <span>Informações do Usuário</span>
        </CardTitle>
        <CardDescription>
          Seus dados pessoais e status da conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status da Conta:</span>
          <Badge className={getStatusColor(user.status)}>
            {getStatusText(user.status)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{user.full_name}</span>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {user.is_admin && (
          <div className="pt-4 border-t">
            <Badge className="bg-blue-100 text-blue-800">
              Administrador
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
