import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OverviewChart = lazy(() =>
  import("@/components/dashboard/OverviewChart").then((module) => ({
    default: module.OverviewChart,
  }))
);

const ProjectsTable = lazy(() =>
  import("@/components/dashboard/ProjectsTable").then((module) => ({
    default: module.ProjectsTable,
  }))
);

const StatCard = ({ title, value, description, icon, color, trend }) => (
  <Card className={`border-none shadow-md ${color}`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && (
        <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
          <ArrowUpRight size={14} />
          {trend}
        </div>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [students, projects, attendance] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact" }),
      ]);

      if (students.error || projects.error || attendance.error)
        throw new Error("Erro ao carregar dados");

      const attendanceCount = attendance.count || 0;
      const presentCount =
        attendance.data?.filter((a) => a.status === "presente").length || 0;
      const attendanceRate =
        attendanceCount > 0
          ? Math.round((presentCount / attendanceCount) * 100)
          : 0;

      return {
        students: students.count || 0,
        projects: projects.count || 0,
        attendanceRate,
      };
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      throw error;
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const renderLoadingSkeletons = () =>
    Array(3)
      .fill(0)
      .map((_, index) => (
        <Skeleton key={index} className="h-[120px] w-full" />
      ));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Bem-vindo ao IBC Connect</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o progresso educacional e cultural dos jovens de nossa
          comunidade em tempo real.
        </p>
      </header>

      <section className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {isLoading ? (
          renderLoadingSkeletons()
        ) : (
          <>
            <StatCard
              title="Alunos"
              value={data?.students || 0}
              description="Total de alunos cadastrados"
              icon={<Users size={20} />}
              color="bg-blue-500"
              trend="+12% este mês"
            />
            <StatCard
              title="Projetos"
              value={data?.projects || 0}
              description="Projetos em andamento"
              icon={<Sparkles size={20} />}
              color="bg-purple-500"
              trend="+3 novos"
            />
            <StatCard
              title="Presença"
              value={`${data?.attendanceRate || 0}%`}
              description="Taxa de presença média"
              icon={<Calendar size={20} />}
              color="bg-green-500"
              trend="+5% de aumento"
            />
          </>
        )}
      </section>

      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">Evolução do Impacto</h2>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          {isClient && <OverviewChart />}
        </Suspense>
      </section>

      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Registrar Presença",
              description:
                "Faça o controle de presença dos alunos nos projetos e atividades.",
              icon: <Calendar size={24} />,
              link: "/frequencia",
              color: "from-primary/10 to-primary/5",
            },
            {
              title: "Lançar Notas",
              description:
                "Atualize o desempenho acadêmico dos alunos no sistema.",
              icon: <Award size={24} />,
              link: "/notas",
              color: "from-secondary/10 to-secondary/5",
            },
            {
              title: "Conquistas",
              description:
                "Acompanhe as conquistas e premiações dos alunos.",
              icon: <TrendingUp size={24} />,
              link: "/student-performance/1",
              color: "from-blue-500/10 to-blue-500/5",
            },
          ].map((action, index) => (
            <Card
              key={index}
              className={`border-none shadow-md bg-gradient-to-br ${action.color}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                {action.icon}
                <Link to={action.link}>
                  <Button variant="ghost" size="sm">
                    Acessar
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-bold">
                  {action.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Projetos em Andamento</h2>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          {isClient && <ProjectsTable />}
        </Suspense>
      </section>

      {error && (
        <Alert className="container mx-auto px-4 mt-8">
          <AlertDescription>
            Erro ao carregar dados. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;
