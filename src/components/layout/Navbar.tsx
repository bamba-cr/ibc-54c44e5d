
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
import { LogoDisplay } from "./LogoDisplay";

const navigationItems = [
  { icon: <LayoutDashboard className="w-4 h-4 mr-2" />, label: "Dashboard", path: "/dashboard" },
  { icon: <Users className="w-4 h-4 mr-2" />, label: "Alunos", path: "/alunos" },
  { icon: <CalendarCheck className="w-4 h-4 mr-2" />, label: "Frequência", path: "/frequencia" },
  { icon: <GraduationCap className="w-4 h-4 mr-2" />, label: "Notas", path: "/notas" },
  { icon: <FileBarChart className="w-4 h-4 mr-2" />, label: "Relatórios", path: "/relatorios" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="border-b frosted-glass sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <LogoDisplay />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:space-x-1">
            {navigationItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <Button 
                  variant="ghost" 
                  className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button 
              variant="ghost" 
              className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              className="inline-flex items-center justify-center rounded-md text-gray-700"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm border-t">
              {navigationItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-primary/5 hover:text-primary">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </div>
                </Link>
              ))}
              <button 
                onClick={handleSignOut}
                className="w-full text-left"
              >
                <div className="flex items-center px-3 py-3 rounded-lg text-red-500 hover:bg-red-50">
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
