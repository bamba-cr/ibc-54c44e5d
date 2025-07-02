
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboardImproved } from '@/components/admin/AdminDashboardImproved';
import { CalendarSection } from '@/components/reports/CalendarSection';
import { StudentsList } from '@/components/reports/StudentsList';
import { ExportSection } from '@/components/reports/ExportSection';
import { ErrorLogsImproved } from '@/components/reports/ErrorLogsImproved';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar, Users, FileText, Settings, BarChart3, Shield, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RelatoriosImproved = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        navigate("/login");
        return;
      }

      if (profile && profile.status !== 'approved') {
        toast({
          title: "Acesso Pendente",
          description: "Sua conta está aguardando aprovação do administrador.",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
    };

    checkAuth();
  }, [user, profile, isLoading, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6 border-gradient-to-r from-blue-500 to-purple-500"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando sistema...</h2>
          <p className="text-gray-600">Aguarde enquanto preparamos tudo para você</p>
        </motion.div>
      </div>
    );
  }

  if (!user || !profile || profile.status !== 'approved') {
    return null;
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header modernizado */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sistema de Gestão Acadêmica
                </h1>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">
                    Olá, <span className="font-semibold">{profile.full_name || profile.username}</span>
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Administrador
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 border-gray-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="calendar" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className={`grid ${
                isAdmin 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-5xl' 
                  : 'grid-cols-2 md:grid-cols-3 max-w-2xl'
              } bg-white shadow-lg border border-gray-200 p-2 rounded-xl backdrop-blur-sm`}>
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendário</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="students"
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Alunos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports"
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Relatórios</span>
                </TabsTrigger>
                {isAdmin && (
                  <>
                    <TabsTrigger 
                      value="admin"
                      className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="logs"
                      className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Logs</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TabsContent value="calendar" className="mt-8">
                <CalendarSection />
              </TabsContent>

              <TabsContent value="students" className="mt-8">
                <StudentsList />
              </TabsContent>

              <TabsContent value="reports" className="mt-8">
                <ExportSection students={students} />
              </TabsContent>

              {isAdmin && (
                <>
                  <TabsContent value="admin" className="mt-8">
                    <AdminDashboardImproved />
                  </TabsContent>

                  <TabsContent value="logs" className="mt-8">
                    <ErrorLogsImproved />
                  </TabsContent>
                </>
              )}
            </motion.div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default RelatoriosImproved;
