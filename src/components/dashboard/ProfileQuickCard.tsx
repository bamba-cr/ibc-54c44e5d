import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  User, 
  Settings, 
  ChevronRight, 
  Shield, 
  Briefcase,
  Mail,
  Phone
} from "lucide-react";

export const ProfileQuickCard = () => {
  const { profile, user } = useAuth();

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getRoleBadge = () => {
    if (profile?.is_admin) {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    
    const roleLabels: Record<string, { label: string; color: string }> = {
      coordenador: { label: "Coordenador", color: "bg-blue-500" },
      instrutor: { label: "Instrutor", color: "bg-green-500" },
      user: { label: "Usuário", color: "bg-gray-500" },
    };
    
    const roleInfo = roleLabels[profile?.role || "user"];
    
    return (
      <Badge className={`${roleInfo.color} text-white border-0 text-xs`}>
        <Briefcase className="h-3 w-3 mr-1" />
        {roleInfo.label}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/60 dark:bg-card/40 backdrop-blur-sm border-border overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {profile?.full_name || profile?.username || 'Usuário'}
                </h3>
                {getRoleBadge()}
              </div>
              
              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                {user?.email && (
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link to="/perfil">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Link */}
          <Button asChild variant="outline" className="w-full mt-3 justify-between" size="sm">
            <Link to="/perfil">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Ver Perfil Completo
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
