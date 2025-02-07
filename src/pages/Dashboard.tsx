
import { Navbar } from "@/components/layout/Navbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, Calendar, BookOpen, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  // Consultas combinadas para melhor desempenho
  const { 
    data: counts,
    isLoading: isLoadingCounts,
    error: countsError
  } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: async () => {
      const [students, projects] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true })
      ]);
      
      if (students.error || projects.error) throw new Error("Erro ao carregar dados");
      
      return {
        students: students.count || 0,
        projects: projects.count || 0
      };
    },
  });

  // Estados de loading e erro
  const renderLoadingSkeletons = () => (
    Array(4).fill(0).map((_, index) => (
      <Skeleton key={index} className="h-[150px] w-full rounded-xl" />
    ))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />
        
        {countsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Erro ao carregar dados. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingCounts ? (
              renderLoadingSkeletons()
            ) : (
              <>
                <StatsCard
                  title="Total de Alunos"
                  value={counts?.students || "0"}
                  description="Alunos matriculados"
                  icon={<Users size={24} aria-label="Alunos" />}
                  loading={isLoadingCounts}
                />
                <StatsCard
                  title="Projetos Ativos"
                  value={counts?.projects || "0"}
                  description="Em andamento"
                  icon={<Calendar size={24} aria-label="Projetos" />}
                  loading={isLoadingCounts}
                />
                <StatsCard
                  title="Frequência Média"
                  value="85%"
                  description="Últimos 30 dias"
                  icon={<Activity size={24} aria-label="Frequência" />}
                />
                <StatsCard
                  title="Disciplinas"
                  value="5"
                  description="Em andamento"
                  icon={<BookOpen size={24} aria-label="Disciplinas" />}
                />
              </>
            )}
          </div>

          {/* Gráficos e Ações Rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OverviewChart />
            </div>
            <div className="space-y-6">
              <QuickActions />
            </div>
          </div>

          {/* Tabela de Projetos */}
          <section aria-labelledby="projects-heading">
            <h3 id="projects-heading" className="text-lg font-semibold mb-4">
              Projetos Ativos
            </h3>
            <ProjectsTable />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
