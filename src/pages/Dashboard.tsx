import { Navbar } from "@/components/layout/Navbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Users, Calendar, BookOpen, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: studentsCount } = useQuery({
    queryKey: ["studentsCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: projectsCount } = useQuery({
    queryKey: ["projectsCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader />
        
        <div className="grid gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Alunos"
              value={studentsCount || "0"}
              description="Alunos matriculados"
              icon={<Users size={24} />}
            />
            <StatsCard
              title="Projetos Ativos"
              value={projectsCount || "0"}
              description="Em andamento"
              icon={<Calendar size={24} />}
            />
            <StatsCard
              title="Frequência Média"
              value="85%"
              description="Últimos 30 dias"
              icon={<Activity size={24} />}
            />
            <StatsCard
              title="Disciplinas"
              value="5"
              description="Em andamento"
              icon={<BookOpen size={24} />}
            />
          </div>

          {/* Charts and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OverviewChart />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Projects Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Projetos Ativos</h3>
            <ProjectsTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;