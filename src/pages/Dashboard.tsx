
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Users, Calendar, Sparkles, TrendingUp, GraduationCap, ArrowRight, ArrowUpRight, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Lazy load components para melhorar performance
const OverviewChart = lazy(() => 
  import("@/components/dashboard/OverviewChart").then((module) => ({
    default: module.OverviewChart
  }))
);

const ProjectsTable = lazy(() => 
  import("@/components/dashboard/ProjectsTable").then((module) => ({
    default: module.ProjectsTable
  }))
);

// Componente card de estatísticas com design moderno
const StatCard = ({ title, value, description, icon, color, trend }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
    className={`frosted-glass rounded-2xl overflow-hidden card-hover`}
  >
    <div className={`h-1 ${color}`}></div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-3 ${color} bg-opacity-10`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center text-sm font-medium text-green-500">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-lg text-gray-500 font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false);

  // Detecta renderização client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Query function memoizada para evitar re-renders desnecessários
  const fetchDashboardData = useCallback(async () => {
    try {
      const [students, projects, attendance] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact" })
      ]);

      if (students.error || projects.error || attendance.error) 
        throw new Error("Erro ao carregar dados");

      // Calcula taxa de presença
      const attendanceCount = attendance.count || 0;
      const presentCount = attendance.data?.filter(a => a.status === 'presente').length || 0;
      const attendanceRate = attendanceCount > 0 
        ? Math.round((presentCount / attendanceCount) * 100) 
        : 0;

      return {
        students: students.count || 0,
        projects: projects.count || 0,
        attendanceRate
      };
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      throw error;
    }
  }, []);

  // Query para dados do dashboard
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const renderLoadingSkeletons = () => 
    Array(3).fill(0).map((_, index) => (
      <Skeleton key={index} className="h-[180px] w-full rounded-xl" />
    ));

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="blob-shape w-[600px] h-[600px] bg-primary/5 top-[-200px] right-[-200px]"></div>
      <div className="blob-shape w-[500px] h-[500px] bg-secondary/10 bottom-[10%] left-[-150px]"></div>
      <div className="wave-pattern absolute inset-0 z-0 opacity-10"></div>
      <div className="dot-pattern absolute inset-0 z-0 opacity-20"></div>
      
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-5xl font-milker text-primary-dark mb-3 relative z-10">
              Instituto Brasileiro Cultural
            </h1>
            <div className="absolute -bottom-2 left-0 w-full h-3 bg-secondary/30 rounded-full z-0"></div>
          </div>
          <p className="text-lg text-gray-600 mt-2">
            Transformando vidas através da cultura e educação
          </p>
        </motion.div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Erro ao carregar dados. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-12">
          {/* Header com Call-to-action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden relative"
          >
            <div className="bg-gradient-to-r from-primary/90 to-primary-dark p-8 md:p-12 relative z-10">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-milker text-white mb-4">Bem-vindo ao IBC Connect</h2>
                <p className="text-white/90 text-lg mb-6">
                  Acompanhe o progresso educacional e cultural dos jovens de nossa comunidade em tempo real.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/alunos">
                    <Button className="bg-white text-primary hover:bg-white/90 rounded-lg flex items-center gap-2 group">
                      Gerenciar Alunos
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/relatorios">
                    <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 rounded-lg">
                      Ver Relatórios
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-secondary/20 to-transparent md:block hidden"></div>
            </div>
            <div className="absolute inset-0 hero-pattern opacity-5 z-0"></div>
          </motion.div>

          {/* Cards de Estatísticas */}
          <div>
            <h2 className="text-2xl font-milker text-primary-dark mb-6 flex items-center">
              <span className="w-1 h-6 bg-secondary rounded-full mr-2"></span>
              Visão Geral
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? renderLoadingSkeletons() : (
                <>
                  <StatCard 
                    title="Jovens Impactados" 
                    value={data?.students.toString() || "0"}
                    description="Jovens beneficiados pelo IBC" 
                    icon={<Users size={24} className="text-blue-600" />}
                    color="bg-blue-500"
                    trend="+12% este mês"
                  />
                  <StatCard 
                    title="Projetos Ativos" 
                    value={data?.projects.toString() || "0"} 
                    description="Projetos culturais em andamento" 
                    icon={<Sparkles size={24} className="text-purple-600" />}
                    color="bg-purple-500"
                    trend="+3 novos"
                  />
                  <StatCard 
                    title="Taxa de Presença" 
                    value={`${data?.attendanceRate || 0}%`} 
                    description="Média de presença nos eventos" 
                    icon={<TrendingUp size={24} className="text-green-600" />}
                    color="bg-green-500"
                    trend="+5% de aumento"
                  />
                </>
              )}
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full"
          >
            <Card className="overflow-hidden border-0 shadow-xl frosted-glass relative card-hover">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 hero-pattern"></div>
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-milker text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-2"></span>
                  Evolução do Impacto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <div className="h-[350px]">
                  <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                    {isClient && <OverviewChart />}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Seção de Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Registrar Presença",
                description: "Faça o controle de presença dos alunos nos projetos e atividades.",
                icon: <Calendar className="h-10 w-10 text-primary" />,
                link: "/frequencia",
                color: "from-primary/10 to-primary/5"
              },
              {
                title: "Lançar Notas",
                description: "Atualize o desempenho acadêmico dos alunos no sistema.",
                icon: <GraduationCap className="h-10 w-10 text-primary" />,
                link: "/notas",
                color: "from-secondary/10 to-secondary/5"
              },
              {
                title: "Conquistas",
                description: "Acompanhe as conquistas e premiações dos alunos.",
                icon: <Award className="h-10 w-10 text-primary" />,
                link: "/student-performance/1",
                color: "from-blue-500/10 to-blue-500/5"
              }
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index + 0.3 }}
              >
                <Link to={action.link} className="block h-full">
                  <Card className={`h-full card-hover border-0 shadow-md bg-gradient-to-br ${action.color}`}>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="rounded-full w-16 h-16 flex items-center justify-center bg-white mb-4">
                        {action.icon}
                      </div>
                      <h3 className="text-xl font-milker mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                      <div className="mt-auto">
                        <Button variant="ghost" className="text-primary hover:text-primary-dark hover:bg-primary/5 p-0 flex items-center gap-2 group animated-border">
                          Acessar
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {/* Tabela de Projetos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="frosted-glass border-0 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-5 hero-pattern"></div>
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl font-milker text-gray-800 flex items-center">
                  <span className="w-1 h-6 bg-secondary rounded-full mr-2"></span>
                  Projetos em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  {isClient && <ProjectsTable />}
                </Suspense>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
