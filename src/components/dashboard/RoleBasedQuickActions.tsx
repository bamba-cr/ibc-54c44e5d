import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  FileBarChart,
  History,
  Calendar,
  TrendingUp,
  UserCog,
  FolderKanban
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/hooks/useAuth";

interface RoleBasedQuickActionsProps {
  role: UserRole;
  isAdmin: boolean;
}

export const RoleBasedQuickActions = ({ role, isAdmin }: RoleBasedQuickActionsProps) => {
  const navigate = useNavigate();

  // Ações base para Instrutor - apenas visualização e registro de frequência/notas
  const instrutorActions = [
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: "Registrar Frequência",
      description: "Registre a presença dos alunos",
      path: "/frequencia",
      color: "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Consultar Frequência",
      description: "Veja o histórico de presença",
      path: "/consulta-frequencia",
      color: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Lançar Notas",
      description: "Registre as notas dos alunos",
      path: "/notas",
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Ver Performance",
      description: "Acompanhe o desempenho dos alunos",
      path: "/student-performance",
      color: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
    }
  ];

  // Ações adicionais para Coordenador - gerenciamento de alunos e projetos
  const coordenadorActions = [
    ...instrutorActions,
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gerenciar Alunos",
      description: "Cadastre e edite alunos",
      path: "/alunos",
      color: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30"
    },
    {
      icon: <History className="h-6 w-6" />,
      title: "Histórico Acadêmico",
      description: "Consulte históricos completos",
      path: "/historico",
      color: "bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30"
    }
  ];

  // Ações completas para Administrador
  const adminActions = [
    ...coordenadorActions,
    {
      icon: <FileBarChart className="h-6 w-6" />,
      title: "Relatórios",
      description: "Acesse relatórios e estatísticas",
      path: "/relatorios",
      color: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
    }
  ];

  // Selecionar ações baseado na função
  const getActionsForRole = () => {
    if (isAdmin) return adminActions;
    
    switch (role) {
      case 'coordenador':
        return coordenadorActions;
      case 'instrutor':
        return instrutorActions;
      default:
        return instrutorActions;
    }
  };

  const actions = getActionsForRole();

  return (
    <Card className="p-4 sm:p-6 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className={`flex flex-col items-center justify-center gap-1 sm:gap-2 h-auto min-h-[100px] sm:min-h-[120px] py-3 sm:py-4 px-2 sm:px-4 transition-all duration-200 border-border hover:border-primary/50 ${action.color}`}
            onClick={() => navigate(action.path)}
          >
            <span className="text-primary shrink-0">{action.icon}</span>
            <span className="font-medium text-foreground text-xs sm:text-sm text-center leading-tight">{action.title}</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight line-clamp-2">{action.description}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
