
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
                  <NavigationMenuItem>
                    <Link to="/dashboard">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/alunos">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <Users className="w-4 h-4 mr-2" />
                        Alunos
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/frequencia">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        Frequência
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/notas">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        Notas
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/relatorios">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <FileBarChart className="w-4 h-4 mr-2" />
                        Relatórios
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/historico">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <History className="w-4 h-4 mr-2" />
                        Histórico
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/configuracoes">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/login">
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
