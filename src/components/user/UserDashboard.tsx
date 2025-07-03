
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const UserDashboard = () => {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header do Usuário */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
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
        </motion.div>

        {/* Dashboard Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg p-2 rounded-2xl">
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Atividade</span>
              </TabsTrigger>
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <BookOpen className="h-4 w-4" />
                <span>Cursos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
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
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Atividade Recente</span>
                  </CardTitle>
                  <CardDescription>
                    Suas atividades mais recentes no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Nenhuma atividade recente</p>
                    <p className="text-sm">Suas atividades aparecerão aqui conforme você usar o sistema</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Meus Cursos</span>
                  </CardTitle>
                  <CardDescription>
                    Cursos e projetos que você está participando
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Nenhum curso encontrado</p>
                    <p className="text-sm">Você será inscrito em cursos conforme disponibilidade</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configurações da Conta</span>
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas preferências e configurações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Configurações em desenvolvimento</p>
                    <p className="text-sm">Em breve você poderá personalizar suas preferências aqui</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};
