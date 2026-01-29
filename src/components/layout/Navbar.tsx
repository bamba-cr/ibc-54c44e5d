import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  GraduationCap,
  FileBarChart,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";


export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, profile } = useAuth();

  const userRole = profile?.role || 'user';
  const isAdmin = profile?.is_admin || false;
  const isCoordOrAdmin = isAdmin || userRole === 'coordenador';

  // Items base para todos os usuários autenticados
  const baseItems = [
    { icon: <LayoutDashboard className="w-4 h-4 mr-2" />, label: "Dashboard", path: "/dashboard" },
    { icon: <CalendarCheck className="w-4 h-4 mr-2" />, label: "Frequência", path: "/frequencia" },
    { icon: <GraduationCap className="w-4 h-4 mr-2" />, label: "Notas", path: "/notas" },
  ];

  // Construir navegação baseada na função
  const navigationItems = [...baseItems];
  
  // Alunos - apenas Coordenador e Admin
  if (isCoordOrAdmin) {
    navigationItems.splice(1, 0, { icon: <Users className="w-4 h-4 mr-2" />, label: "Alunos", path: "/alunos" });
  }
  
  // Relatórios - apenas Admin
  if (isAdmin) {
    navigationItems.push({ icon: <FileBarChart className="w-4 h-4 mr-2" />, label: "Relatórios", path: "/relatorios" });
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-milker text-gradient">
                IBC CONNECT
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigationItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <Button 
                  variant="ghost" 
                  className="flex items-center px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="flex items-center px-3 py-2 rounded-lg text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <div className="ml-2 border-l border-border pl-2">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className="inline-flex items-center justify-center rounded-md text-foreground"
              onClick={toggleMenu}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card/95 backdrop-blur-lg border-t border-border">
              {navigationItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center px-3 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </div>
                </Link>
              ))}
              <button 
                onClick={handleSignOut}
                className="w-full text-left"
              >
                <div className="flex items-center px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
