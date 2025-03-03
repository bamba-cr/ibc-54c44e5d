
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DashboardHeader = ({ 
  title = "Dashboard", 
  subtitle = "Bem-vindo ao painel de controle do IBC CONNECT" 
}: DashboardHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
    >
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-milker text-primary-dark">{title}</h1>
        <p className="text-gray-600 mt-1 font-montserrat">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 w-[200px] bg-white/80 backdrop-blur border-gray-200 focus:border-primary" 
          />
        </div>
        <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};
