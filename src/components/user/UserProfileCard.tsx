
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/types/auth';
import { User } from '@supabase/supabase-js';
import { Mail, Phone, Calendar } from 'lucide-react';

interface UserProfileCardProps {
  profile: UserProfile;
  user: User;
}

export const UserProfileCard = ({ profile, user }: UserProfileCardProps) => {
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
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <div className="flex items-center space-x-6">
        <Avatar className="h-24 w-24 border-4 border-blue-200">
          <AvatarImage src={profile?.avatar_url || ''} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-800">
              {profile?.full_name || profile?.username || 'Usuário'}
            </h1>
            <Badge className={`px-3 py-1 ${getStatusColor(profile?.status || 'pending')}`}>
              {getStatusText(profile?.status || 'pending')}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{profile?.email || user?.email}</span>
            </div>
            
            {profile?.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                Membro desde {new Date(profile?.created_at || '').toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
