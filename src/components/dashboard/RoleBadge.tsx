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
        className: "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      };
    }

    switch (role) {
      case 'coordenador':
        return {
          label: "Coordenador",
          icon: <Users className="h-3 w-3" />,
          variant: "default" as const,
          className: "bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
        };
      case 'instrutor':
        return {
          label: "Instrutor",
          icon: <GraduationCap className="h-3 w-3" />,
          variant: "secondary" as const,
          className: "bg-accent hover:bg-accent/90 text-accent-foreground"
        };
      default:
        return {
          label: "Usuário",
          icon: <User className="h-3 w-3" />,
          variant: "outline" as const,
          className: "border-border text-foreground"
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
