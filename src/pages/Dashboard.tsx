import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { RoleBasedQuickActions } from "@/components/dashboard/RoleBasedQuickActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarSection } from "@/components/reports/CalendarSection";
import { StudentSearchCard } from "@/components/dashboard/StudentSearchCard";
import { BirthdayWidget } from "@/components/dashboard/BirthdayWidget";
import { ProfileQuickCard } from "@/components/dashboard/ProfileQuickCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  FolderKanban
} from "lucide-react";

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

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const SectionHeader = ({ icon, title, description }: SectionHeaderProps) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="p-2 rounded-lg bg-primary/10 text-primary">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  </div>
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
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  const userRole = profile?.role || 'user';
  const isAdmin = profile?.is_admin || false;
  const isCoordOrAdmin = isAdmin || userRole === 'coordenador';

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Bem-vindo{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
              </h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isAdmin 
                ? "Painel administrativo completo do sistema."
                : userRole === 'coordenador'
                ? "Gerencie alunos, projetos e acompanhe o progresso."
                : "Registre frequência e notas dos alunos."
              }
            </p>
          </div>
          <Button asChild variant="ghost" className="flex items-center gap-2 h-auto py-2 px-3">
            <Link to="/perfil">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{profile?.full_name?.split(' ')[0] || 'Perfil'}</span>
            </Link>
          </Button>
        </header>

        <Separator className="bg-border/50" />

        {/* Stats Overview */}
        <section>
          <SectionHeader 
            icon={<TrendingUp className="h-5 w-5" />}
            title="Visão Geral"
            description="Estatísticas do sistema"
          />
          <DashboardStats />
        </section>

        {/* Quick Actions */}
        <section>
          <SectionHeader 
            icon={<Zap className="h-5 w-5" />}
            title="Ações Rápidas"
            description="Acesse as principais funcionalidades"
          />
          <RoleBasedQuickActions role={userRole} isAdmin={isAdmin} />
        </section>

        {/* Analytics & Activity Row */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns on xl */}
          <Card className="xl:col-span-2 bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Evolução do Impacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[280px] w-full" />}>
                {isClient && <OverviewChart />}
              </Suspense>
            </CardContent>
          </Card>

          {/* Recent Activity - Takes 1 column on xl */}
          <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </section>

        {/* Tools & Resources Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {/* Profile Quick Card - 1 column */}
          <ProfileQuickCard />

          {/* Birthday Widget - 1 column */}
          <BirthdayWidget />

          {/* Student Search - 1 column */}
          <StudentSearchCard />

          {/* Calendar Section - 2 columns */}
          <div className="xl:col-span-2">
            <CalendarSection />
          </div>
        </section>

        {/* Projects Table - Only for Coord/Admin */}
        {isCoordOrAdmin && (
          <section>
            <SectionHeader 
              icon={<FolderKanban className="h-5 w-5" />}
              title="Projetos em Andamento"
              description="Acompanhe o status dos projetos"
            />
            <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border">
              <CardContent className="pt-6">
                <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                  {isClient && <ProjectsTable />}
                </Suspense>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Bottom spacing for mobile nav */}
        <div className="h-20 md:hidden" />
      </main>
    </div>
  );
};

export default Dashboard;


