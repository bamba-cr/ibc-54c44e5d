
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, Calendar, BookOpen, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// Create StudentPerformance component within this file instead of importing it
const StudentPerformance = () => {
  return (
    <div className="p-4 text-center">
      <h4 className="text-lg font-medium text-gray-600 mb-2">Visualização de Desempenho</h4>
      <p>Dados de desempenho serão exibidos aqui.</p>
    </div>
  );
};

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false);

  // Efeito para detectar renderização no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memorizar a função de consulta para evitar re-renders desnecessários
  const fetchDashboardCounts = useCallback(async () => {
    try {
      const [students, projects] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true })
      ]);

      if (students.error || projects.error) throw new Error("Erro ao carregar dados");

      return {
        students: students.count || 0,
        projects: projects.count || 0
      };
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      throw error;
    }
  }, []);

  // Consultas combinadas para melhor desempenho
  const { data: counts, isLoading: isLoadingCounts, error: countsError } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: fetchDashboardCounts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Estados de loading e erro
  const renderLoadingSkeletons = () => 
    Array(4).fill(0).map((_, index) => (
      <Skeleton key={index} className="h-[150px] w-full rounded-xl" />
    ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader 
          title="Instituto Brasileiro Cultural e Socioeducativo - IBC"
          subtitle="Transformando vidas através da cultura e educação"
        />
        
        {countsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Erro ao carregar dados. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingCounts ? renderLoadingSkeletons() : (
              <>
                <StatsCard
                  title="Jovens Impactados"
                  value={counts?.students.toString() || "0"}
                  description="Jovens beneficiados pelos nossos programas"
                  icon={<Users size={24} aria-label="Jovens" className="text-blue-600" />}
                  loading={isLoadingCounts}
                />
                <StatsCard
                  title="Projetos Culturais"
                  value={counts?.projects.toString() || "0"}
                  description="Projetos em andamento"
                  icon={<Calendar size={24} aria-label="Projetos" className="text-green-600" />}
                  loading={isLoadingCounts}
                />
                <StatsCard
                  title="Engajamento"
                  value="92%"
                  description="Taxa de participação nos últimos 6 meses"
                  icon={<Activity size={24} aria-label="Engajamento" className="text-purple-600" />}
                />
                <StatsCard
                  title="Oficinas Realizadas"
                  value="15"
                  description="Oficinas de arte, cultura e educação"
                  icon={<BookOpen size={24} aria-label="Oficinas" className="text-orange-600" />}
                />
              </>
            )}
          </div>

          {/* Chart and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {isClient && <OverviewChart />}
              </Suspense>
            </div>
            <div className="space-y-6">
              <QuickActions />
            </div>
          </div>

          {/* Student Performance Section */}
          <section aria-labelledby="performance-heading" className="bg-white p-8 rounded-3xl shadow-lg">
            <h3 
              id="performance-heading"
              className="text-3xl font-bold mb-6 text-center text-gray-800"
              style={{ fontFamily: 'Milker' }}
            >
              Desempenho dos Alunos
            </h3>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {isClient && <StudentPerformance />}
            </Suspense>
          </section>

          {/* Projects Section */}
          <section aria-labelledby="projects-heading" className="bg-white p-8 rounded-3xl shadow-lg">
            <h3 
              id="projects-heading"
              className="text-3xl font-bold mb-6 text-center text-gray-800"
              style={{ fontFamily: 'Cinematografica' }}
            >
              Projetos em Destaque
            </h3>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {isClient && <ProjectsTable />}
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
