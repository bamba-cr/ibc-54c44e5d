import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RoleBasedQuickActions } from "@/components/dashboard/RoleBasedQuickActions";
import { RoleBadge } from "@/components/dashboard/RoleBadge";
import { CalendarSection } from "@/components/reports/CalendarSection";
import { StudentSearchCard } from "@/components/dashboard/StudentSearchCard";

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

  const userRole = profile?.role || 'user';
  const isAdmin = profile?.is_admin || false;
  const isCoordOrAdmin = isAdmin || userRole === 'coordenador';

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations for dark mode */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <Navbar />

      <header className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo ao IBC Connect{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin 
                ? "Painel administrativo completo do sistema."
                : userRole === 'coordenador'
                ? "Gerencie alunos, projetos e acompanhe o progresso."
                : "Registre frequência e notas dos alunos."
              }
            </p>
          </div>
          <RoleBadge role={userRole} isAdmin={isAdmin} />
        </div>
      </header>

      <section className="container mx-auto px-4 mt-8">
        <DashboardStats />
      </section>

      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">Evolução do Impacto</h2>
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {isClient && <OverviewChart />}
            </Suspense>
          </div>
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">Atividades Recentes</h2>
            <RecentActivity />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-8">
        <RoleBasedQuickActions role={userRole} isAdmin={isAdmin} />
      </section>

      {/* Busca de Alunos e Calendário - visível para todos */}
      <section className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Buscar Alunos</h2>
            <StudentSearchCard />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Calendário de Eventos</h2>
            <CalendarSection />
          </div>
        </div>
      </section>

      {/* Projetos em Andamento - visível apenas para Coordenador e Admin */}
      {isCoordOrAdmin && (
        <section className="container mx-auto px-4 mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-foreground">Projetos em Andamento</h2>
          <div className="bg-card/60 dark:bg-card/40 backdrop-blur-sm rounded-xl p-6 border border-border">
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              {isClient && <ProjectsTable />}
            </Suspense>
          </div>
        </section>
      )}

      {/* Espaçamento inferior para mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default Dashboard;


