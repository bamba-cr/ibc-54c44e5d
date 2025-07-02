
import { useEffect, useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Calendar, Users, FileText, Settings, BarChart3, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Relatorios = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');

  // Query para buscar dados dos estudantes com tratamento de erro
  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching students:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Failed to fetch students:', error);
        throw error;
      }
    },
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para buscar dados dos projetos
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        return [];
      }
    },
    retry: 2,
  });

  // Query para buscar dados de frequência
  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("attendance")
          .select(`
            *,
            students(name),
            projects(name)
          `)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return [];
      }
    },
    retry: 2,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && !user) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
          variant: "destructive",
        });
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
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Carregando sistema...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth check
  if (!user || !profile || profile.status !== 'approved') {
    return null;
  }

  const isAdmin = profile?.is_admin || false;

  // Error state for critical data
  if (studentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Erro no Sistema</h2>
            <p className="text-gray-600 text-center mb-4">
              Não foi possível carregar os dados do sistema. Verifique sua conexão e tente novamente.
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Dashboard
              </Button>
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
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {studentsLoading ? '...' : students?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Projetos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {projectsLoading ? '...' : projects?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Frequências Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {attendanceLoading ? '...' : 
                    attendance?.filter(a => 
                      new Date(a.date).toDateString() === new Date().toDateString()
                    ).length || 0
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Taxa de Presença</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {attendanceLoading ? '...' : 
                    attendance?.length > 0 ? 
                      Math.round((attendance.filter(a => a.status === 'presente').length / attendance.length) * 100) + '%' : 
                      '0%'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                <ExportSection students={students || []} />
              </TabsContent>

              {isAdmin && (
                <>
                  <TabsContent value="admin" className="mt-6">
                    <AdminDashboardImproved />
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
