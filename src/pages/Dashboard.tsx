import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
  Calendar,
  GraduationCap,
  Award,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

// Handle potential import errors
const OverviewChart = lazy(() =>
  import("@/components/dashboard/OverviewChart")
    .then((m) => ({ default: m.OverviewChart }))
    .catch(() => ({ default: () => <div>Chart failed to load</div> }))
);

const ProjectsTable = lazy(() =>
  import("@/components/dashboard/ProjectsTable")
    .then((m) => ({ default: m.ProjectsTable }))
    .catch(() => ({ default: () => <div>Projects table failed to load</div> }))
);

const Dashboard = () => {
  const [isClient, setIsClient] = useState(false);
  const { profile, isLoading } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">
          Bem-vindo ao IBC Connect{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o progresso educacional e cultural dos jovens de nossa
          comunidade em tempo real.
        </p>
      </header>

      <section className="container mx-auto px-4 mt-8">
        <DashboardStats />
      </section>

      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Evolução do Impacto</h2>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {isClient && <OverviewChart />}
            </Suspense>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
            <RecentActivity />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              title: "Performance",
              description:
                "Acompanhe o desempenho e conquistas dos alunos.",
              icon: <TrendingUp size={24} />,
              link: "/student-performance",
              color: "from-blue-500/10 to-blue-500/5",
            },
            {
              title: "Histórico",
              description:
                "Consulte o histórico acadêmico dos alunos.",
              icon: <GraduationCap size={24} />,
              link: "/historico",
              color: "from-purple-500/10 to-purple-500/5",
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
    </div>
  );
};

export default Dashboard;


