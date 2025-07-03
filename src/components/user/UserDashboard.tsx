
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Settings,
  BookOpen,
  BarChart3,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfileCard } from './UserProfileCard';
import { UserInfoSection } from './UserInfoSection';

export const UserDashboard = () => {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!profile || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header do Usuário */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UserProfileCard profile={profile} user={user} />
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

            <TabsContent value="profile" className="space-y-6">
              <UserInfoSection profile={profile} user={user} />
            </TabsContent>

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
