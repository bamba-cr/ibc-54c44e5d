
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Users, Calendar, Sparkles, TrendingUp, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Lazy load components to improve performance
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

// Stat card component with consistent font usage
const StatCard = ({ title, value, description, icon, color }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay: Math.random() * 0.3 }}
    className={`glass-card p-6 rounded-2xl ${color} border-l-4`}
  >
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="text-xl font-draper text-gray-700">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 font-montserrat">{description}</p>
      </div>
      <div className={`rounded-full p-3 ${color.replace('border-l-4', 'bg-opacity-10')} bg-opacity-20`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false);

  // Effect to detect client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the query function to avoid unnecessary rerenders
  const fetchDashboardData = useCallback(async () => {
    try {
      const [students, projects, attendance] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact" })
      ]);

      if (students.error || projects.error || attendance.error) 
        throw new Error("Erro ao carregar dados");

      // Calculate attendance rate
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

  // Query for dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const renderLoadingSkeletons = () => 
    Array(3).fill(0).map((_, index) => (
      <Skeleton key={index} className="h-[150px] w-full rounded-xl" />
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-secondary/5">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-milker text-primary-dark mb-2">
            Instituto Brasileiro Cultural
          </h1>
          <p className="text-lg text-gray-600 font-montserrat">
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
        
        <div className="space-y-10">
          {/* Stats Cards - Only showing data that's fully implemented */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? renderLoadingSkeletons() : (
              <>
                <StatCard 
                  title="Jovens Impactados" 
                  value={data?.students.toString() || "0"}
                  description="Jovens beneficiados pelo IBC" 
                  icon={<Users size={28} className="text-blue-600" />}
                  color="border-blue-500"
                />
                <StatCard 
                  title="Projetos Ativos" 
                  value={data?.projects.toString() || "0"} 
                  description="Projetos culturais em andamento" 
                  icon={<Sparkles size={28} className="text-purple-600" />}
                  color="border-purple-500"
                />
                <StatCard 
                  title="Taxa de Presença" 
                  value={`${data?.attendanceRate || 0}%`} 
                  description="Média de presença nos eventos" 
                  icon={<TrendingUp size={28} className="text-green-600" />}
                  color="border-green-500"
                />
              </>
            )}
          </div>

          {/* Only showing chart and projects table as they're fully functional */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-cinematografica text-gray-800 mb-4">Evolução do Impacto</h2>
                <div className="h-[350px]">
                  <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                    {isClient && <OverviewChart />}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Projects Table Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <section className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="section-title mb-6 font-cinematografica">Projetos em Andamento</h2>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {isClient && <ProjectsTable />}
              </Suspense>
            </section>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
