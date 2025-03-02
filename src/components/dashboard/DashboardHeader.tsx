
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export const DashboardHeader = ({ title = "Dashboard", subtitle = "Bem-vindo ao painel de controle do IBC CONNECT" }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">
          {subtitle}
        </p>
      </div>
      <Button variant="outline" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
    </div>
  );
};
