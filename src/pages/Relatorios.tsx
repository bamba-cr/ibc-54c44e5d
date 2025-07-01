
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CalendarSection } from '@/components/reports/CalendarSection';
import { StudentsList } from '@/components/reports/StudentsList';
import { ExportSection } from '@/components/reports/ExportSection';
import { ErrorLogsImproved } from '@/components/reports/ErrorLogsImproved';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Calendar, Users, FileText, Settings, BarChart3, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Relatorios = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.status !== 'approved') {
    return null;
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Gestão Acadêmica
                </h1>
                <p className="text-sm text-gray-600">
                  Bem-vindo, {profile.full_name || profile.username}
                  {isAdmin && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
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
          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className={`grid w-full ${
              isAdmin 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-4xl' 
                : 'grid-cols-2 md:grid-cols-3 max-w-2xl'
            } mx-auto bg-white shadow-sm border border-gray-200 p-1 rounded-lg`}>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendário</span>
              </TabsTrigger>
              <TabsTrigger 
                value="students"
                className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Alunos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
              {isAdmin && (
                <>
                  <TabsTrigger 
                    value="admin"
                    className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="logs"
                    className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Logs</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TabsContent value="calendar" className="mt-6">
                <CalendarSection />
              </TabsContent>

              <TabsContent value="students" className="mt-6">
                <StudentsList />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <ExportSection students={students} />
              </TabsContent>

              {isAdmin && (
                <>
                  <TabsContent value="admin" className="mt-6">
                    <AdminDashboard />
                  </TabsContent>

                  <TabsContent value="logs" className="mt-6">
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

export default Relatorios;
