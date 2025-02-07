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

        <div className="grid gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingCounts ? (
              renderLoadingSkeletons()
            ) : (
              <>
                <StatsCard
                  title="Jovens Impactados"
                  value={counts?.students || "0"}
                  description="Jovens beneficiados pelos nossos programas"
                  icon={<Users size={24} aria-label="Jovens" className="text-blue-600" />}
                  loading={isLoadingCounts}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatsCard
                  title="Projetos Culturais"
                  value={counts?.projects || "0"}
                  description="Projetos em andamento"
                  icon={<Calendar size={24} aria-label="Projetos" className="text-green-600" />}
                  loading={isLoadingCounts}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatsCard
                  title="Engajamento"
                  value="92%"
                  description="Taxa de participação nos últimos 6 meses"
                  icon={<Activity size={24} aria-label="Engajamento" className="text-purple-600" />}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                />
                <StatsCard
                  title="Oficinas Realizadas"
                  value="15"
                  description="Oficinas de arte, cultura e educação"
                  icon={<BookOpen size={24} aria-label="Oficinas" className="text-orange-600" />}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                />
              </>
            )}
          </div>

          {/* Gráficos e Ações Rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OverviewChart 
                title="Desempenho dos Projetos"
                description="Acompanhe o progresso dos projetos culturais e socioeducativos"
              />
            </div>
            <div className="space-y-6">
              <QuickActions 
                title="Ações Rápidas"
                actions={[
                  { label: "Adicionar Novo Projeto", icon: <Calendar size={18} />, onClick: () => {} },
                  { label: "Cadastrar Jovem", icon: <Users size={18} />, onClick: () => {} },
                  { label: "Gerar Relatório", icon: <Activity size={18} />, onClick: () => {} },
                ]}
              />
            </div>
          </div>

          {/* Tabela de Projetos */}
          <section aria-labelledby="projects-heading" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 id="projects-heading" className="text-xl font-semibold mb-4 text-gray-800">
              Projetos em Destaque
            </h3>
            <ProjectsTable />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
