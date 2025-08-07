import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Users, Calendar, Sparkles, TrendingUp } from "lucide-react";

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      try {
        const [students, projects, attendance, grades] = await Promise.all([
          supabase.from("students").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("attendance").select("status", { count: "exact" }),
          supabase.from("grades").select("grade").not("grade", "is", null),
        ]);

        if (students.error || projects.error || attendance.error || grades.error) {
          throw new Error("Erro ao carregar dados");
        }

        const attendanceCount = attendance.count || 0;
        const presentCount =
          attendance.data?.filter((a) => a.status === "presente").length || 0;
        const attendanceRate =
          attendanceCount > 0
            ? Math.round((presentCount / attendanceCount) * 100)
            : 0;

        const averageGrade = grades.data?.length > 0 
          ? grades.data.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.data.length
          : 0;

        return {
          students: students.count || 0,
          projects: projects.count || 0,
          attendanceRate,
          averageGrade: Math.round(averageGrade * 10) / 10,
        };
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Alunos"
        value={stats?.students || 0}
        description="Total de alunos cadastrados"
        icon={<Users size={20} className="text-primary" />}
        loading={isLoading}
      />
      <StatsCard
        title="Projetos"
        value={stats?.projects || 0}
        description="Projetos em andamento"
        icon={<Sparkles size={20} className="text-secondary" />}
        loading={isLoading}
      />
      <StatsCard
        title="Presença"
        value={`${stats?.attendanceRate || 0}%`}
        description="Taxa de presença média"
        icon={<Calendar size={20} className="text-green-500" />}
        loading={isLoading}
      />
      <StatsCard
        title="Média Geral"
        value={stats?.averageGrade || 0}
        description="Nota média dos alunos"
        icon={<TrendingUp size={20} className="text-blue-500" />}
        loading={isLoading}
      />
    </div>
  );
};