
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarSection } from '@/components/reports/CalendarSection';
import { StudentsList } from '@/components/reports/StudentsList';
import { ExportSection } from '@/components/reports/ExportSection';
import { ErrorLogsImproved } from '@/components/reports/ErrorLogsImproved';
import { EnhancedUserManagement } from '@/components/admin/EnhancedUserManagement';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LogOut, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Shield, 
  Download,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImprovedRelatorios = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Query otimizada para estudantes
  const { data: students, isLoading: studentsLoading, refetch: refetchStudents } = useQuery({
    queryKey: ["students-improved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          student_projects!inner(
            project_id,
            projects(name, code)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });

  // Query para projetos
  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code")
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  // Query para estatísticas
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [studentsResult, attendanceResult, gradesResult] = await Promise.all([
        supabase.from("students").select("id", { count: 'exact' }),
        supabase.from("attendance").select("id", { count: 'exact' }),
        supabase.from("grades").select("grade").not("grade", "is", null)
      ]);

      const totalStudents = studentsResult.count || 0;
      const totalAttendance = attendanceResult.count || 0;
      const grades = gradesResult.data || [];
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length 
        : 0;

      return {
        totalStudents,
        totalAttendance,
        averageGrade: Math.round(averageGrade * 100) / 100,
        totalProjects: projects?.length || 0,
      };
    },
    enabled: !!projects,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  });

  // Filtrar estudantes
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = projectFilter === 'all' || 
        student.student_projects?.some((sp: any) => sp.project_id === projectFilter);

      return matchesSearch && matchesProject;
    });
  }, [students, searchTerm, projectFilter]);

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
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
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

      {/* Dashboard Stats */}
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total de Alunos</p>
                  <p className="text-3xl font-bold text-blue-800">{stats?.totalStudents || 0}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Projetos</p>
                  <p className="text-3xl font-bold text-green-800">{stats?.totalProjects || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Presenças</p>
                  <p className="text-3xl font-bold text-purple-800">{stats?.totalAttendance || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Média Geral</p>
                  <p className="text-3xl font-bold text-orange-800">{stats?.averageGrade || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="students" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className={`grid ${
                isAdmin 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-5xl' 
                  : 'grid-cols-2 md:grid-cols-3 max-w-2xl'
              } bg-white shadow-lg border border-gray-200 p-2 rounded-xl backdrop-blur-sm`}>
                <TabsTrigger 
                  value="students" 
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Alunos</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="calendar" 
                  className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendário</span>
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
              <TabsContent value="students" className="mt-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Lista de Alunos
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => refetchStudents()}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Atualizar
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Visualize e gerencie todos os alunos cadastrados no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Filtros melhorados */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex items-center gap-2 flex-1">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Pesquisar por nome, CPF ou cidade..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filtrar por projeto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os projetos</SelectItem>
                            {projects?.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {studentsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span>Carregando alunos...</span>
                      </div>
                    ) : (
                      <StudentsList students={filteredStudents} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-8">
                <CalendarSection />
              </TabsContent>

              <TabsContent value="reports" className="mt-8">
                <ExportSection students={filteredStudents} />
              </TabsContent>

              {isAdmin && (
                <>
                  <TabsContent value="admin" className="mt-8">
                    <EnhancedUserManagement />
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

export default ImprovedRelatorios;
