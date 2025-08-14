import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, CalendarCheck, GraduationCap, FileBarChart } from "lucide-react";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

export const BottomNav = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  // Hide on auth/public routes
  const hiddenPaths = ["/", "/login", "/recuperar-senha", "/resetar-senha", "/auth"];
  const isHidden = hiddenPaths.includes(location.pathname);

  if (!user || isHidden) return null;

  const items = [
    { to: "/dashboard", label: "Início", icon: LayoutDashboard, tooltip: "Ir para o painel principal" },
    { to: "/alunos", label: "Alunos", icon: Users, tooltip: "Gerenciar cadastro de alunos" },
    { to: "/frequencia", label: "Frequência", icon: CalendarCheck, tooltip: "Registrar presença dos alunos" },
    { to: "/notas", label: "Notas", icon: GraduationCap, tooltip: "Lançar e editar notas" },
  ];

  if (profile?.is_admin) {
    items.push({ to: "/relatorios", label: "Relatórios", icon: FileBarChart, tooltip: "Acessar relatórios e administração" });
  }

  return (
    <nav
      aria-label="Navegação inferior"
      role="navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
    >
      <ul className="flex">
        {items.map(({ to, label, icon: Icon, tooltip }) => (
          <li key={to} className="flex-1">
            <TooltipWrapper content={tooltip} side="top">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="mt-0.5 leading-none">{label}</span>
              </NavLink>
            </TooltipWrapper>
          </li>
        ))}
      </ul>
    </nav>
  );
};
