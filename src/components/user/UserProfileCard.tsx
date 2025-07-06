
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';
import { Mail, Phone, User as UserIcon, Edit } from 'lucide-react';

interface UserProfileCardProps {
  user: User;
  onEdit?: () => void;
}

export const UserProfileCard = ({ user, onEdit }: UserProfileCardProps) => {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>{user.full_name}</span>
            </CardTitle>
            <CardDescription>
              {user.email}
            </CardDescription>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge className={getStatusColor(user.status)}>
            {getStatusText(user.status)}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{user.phone}</span>
            </div>
          )}
        </div>

        {user.is_admin && (
          <Badge className="bg-blue-100 text-blue-800">
            Administrador
          </Badge>
        )}

        {user.status === 'rejected' && user.rejection_reason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">
              <strong>Motivo da rejeição:</strong> {user.rejection_reason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
