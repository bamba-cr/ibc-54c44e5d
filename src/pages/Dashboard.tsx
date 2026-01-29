import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RoleBasedQuickActions } from "@/components/dashboard/RoleBasedQuickActions";
import { RoleBadge } from "@/components/dashboard/RoleBadge";

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
      <Navbar />

      <header className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
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
        <RoleBasedQuickActions role={userRole} isAdmin={isAdmin} />
      </section>

      {/* Projetos em Andamento - visível apenas para Coordenador e Admin */}
      {isCoordOrAdmin && (
        <section className="container mx-auto px-4 mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Projetos em Andamento</h2>
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            {isClient && <ProjectsTable />}
          </Suspense>
        </section>
      )}

      {/* Espaçamento inferior para mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default Dashboard;


