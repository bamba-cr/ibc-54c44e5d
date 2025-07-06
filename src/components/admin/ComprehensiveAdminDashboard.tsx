
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedUserManagement } from './EnhancedUserManagement';
import { UserManagementImproved } from './UserManagementImproved';
import { SystemSettings } from './SystemSettings';
import { LogoSettings } from './LogoSettings';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Settings, 
  Image, 
  Shield, 
  BarChart3, 
  Database,
  UserCheck,
  Clock,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ComprehensiveAdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Query para estatísticas dos usuários usando a tabela profiles
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('status, is_admin');
      
      if (error) throw error;
      
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(u => u.status === 'pending').length || 0,
        approved: data?.filter(u => u.status === 'approved').length || 0,
        rejected: data?.filter(u => u.status === 'rejected').length || 0,
        admins: data?.filter(u => u.is_admin).length || 0,
      };
      
      return stats;
    },
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Centro de Administração</h1>
              <p className="text-blue-100 text-lg mt-2">
                Gestão completa do sistema educacional
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              Administrador: {user?.full_name}
            </Badge>
          </div>
        </motion.div>

        {/* Dashboard Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg p-2 rounded-2xl">
              <TabsTrigger 
                value="overview" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Usuários</span>
              </TabsTrigger>
              <TabsTrigger 
                value="approvals" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Aprovações</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customization" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Visual</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
                          <p className="text-3xl font-bold">{userStats?.total || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Users className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm font-medium">Pendentes</p>
                          <p className="text-3xl font-bold">{userStats?.pending || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Clock className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Aprovados</p>
                          <p className="text-3xl font-bold">{userStats?.approved || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <UserCheck className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm font-medium">Rejeitados</p>
                          <p className="text-3xl font-bold">{userStats?.rejected || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <AlertTriangle className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Administradores</p>
                          <p className="text-3xl font-bold">{userStats?.admins || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-full">
                          <Shield className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">Ações Rápidas</CardTitle>
                    <CardDescription>
                      Acesse rapidamente as funcionalidades mais utilizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Clock className="h-8 w-8 mb-3 mx-auto" />
                        <h3 className="font-semibold text-lg">Aprovar Usuários</h3>
                        <p className="text-sm opacity-90 mt-1">
                          {userStats?.pending || 0} usuários aguardando
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab('users')}
                        className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Users className="h-8 w-8 mb-3 mx-auto" />
                        <h3 className="font-semibold text-lg">Gerenciar Usuários</h3>
                        <p className="text-sm opacity-90 mt-1">
                          Visualizar e editar perfis
                        </p>
                      </button>

                      <button
                        onClick={() => setActiveTab('settings')}
                        className="p-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <Settings className="h-8 w-8 mb-3 mx-auto" />
                        <h3 className="font-semibold text-lg">Configurações</h3>
                        <p className="text-sm opacity-90 mt-1">
                          Ajustar sistema
                        </p>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-0">
              <EnhancedUserManagement />
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-0">
              <UserManagementImproved />
            </TabsContent>

            {/* Customization Tab */}
            <TabsContent value="customization" className="space-y-0">
              <LogoSettings />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-0">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};
