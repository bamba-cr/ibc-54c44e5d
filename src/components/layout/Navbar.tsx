
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap,
  FileBarChart,
  History,
  Settings,
  LogOut
} from "lucide-react";

export const Navbar = () => {
  const navigationItems = [
    { icon: <LayoutDashboard className="w-4 h-4 mr-2" />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users className="w-4 h-4 mr-2" />, label: "Alunos", path: "/alunos" },
    { icon: <CalendarCheck className="w-4 h-4 mr-2" />, label: "Frequência", path: "/frequencia" },
    { icon: <GraduationCap className="w-4 h-4 mr-2" />, label: "Notas", path: "/notas" },
    { icon: <FileBarChart className="w-4 h-4 mr-2" />, label: "Relatórios", path: "/relatorios" },
    { icon: <History className="w-4 h-4 mr-2" />, label: "Histórico", path: "/historico" },
    { icon: <Settings className="w-4 h-4 mr-2" />, label: "Configurações", path: "/configuracoes" },
    { icon: <LogOut className="w-4 h-4 mr-2" />, label: "Sair", path: "/login" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                IBC CONNECT
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationItems.map((item, index) => (
                    <NavigationMenuItem key={index}>
                      <Link to={item.path}>
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          {item.icon}
                          {item.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
