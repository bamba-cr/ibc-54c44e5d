import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, CalendarCheck, GraduationCap, FileBarChart } from "lucide-react";

export const BottomNav = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  // Hide on auth/public routes
  const hiddenPaths = ["/", "/login", "/recuperar-senha", "/resetar-senha", "/auth"];
  const isHidden = hiddenPaths.includes(location.pathname);

  if (!user || isHidden) return null;

  const items = [
    { to: "/dashboard", label: "Início", icon: LayoutDashboard },
    { to: "/alunos", label: "Alunos", icon: Users },
    { to: "/frequencia", label: "Frequência", icon: CalendarCheck },
    { to: "/notas", label: "Notas", icon: GraduationCap },
  ];

  if (profile?.is_admin) {
    items.push({ to: "/relatorios", label: "Relatórios", icon: FileBarChart });
  }

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
    >
      <ul className="flex">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 text-xs transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 leading-none">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
