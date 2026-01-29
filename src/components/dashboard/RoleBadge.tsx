import { Badge } from "@/components/ui/badge";
import { Shield, Users, GraduationCap, User } from "lucide-react";
import { UserRole } from "@/hooks/useAuth";

interface RoleBadgeProps {
  role: UserRole;
  isAdmin: boolean;
}

export const RoleBadge = ({ role, isAdmin }: RoleBadgeProps) => {
  const getRoleConfig = () => {
    if (isAdmin) {
      return {
        label: "Administrador",
        icon: <Shield className="h-3 w-3" />,
        variant: "destructive" as const,
        className: "bg-red-500 hover:bg-red-600"
      };
    }

    switch (role) {
      case 'coordenador':
        return {
          label: "Coordenador",
          icon: <Users className="h-3 w-3" />,
          variant: "default" as const,
          className: "bg-blue-500 hover:bg-blue-600"
        };
      case 'instrutor':
        return {
          label: "Instrutor",
          icon: <GraduationCap className="h-3 w-3" />,
          variant: "secondary" as const,
          className: "bg-green-500 hover:bg-green-600 text-white"
        };
      default:
        return {
          label: "Usuário",
          icon: <User className="h-3 w-3" />,
          variant: "outline" as const,
          className: ""
        };
    }
  };

  const config = getRoleConfig();

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};
