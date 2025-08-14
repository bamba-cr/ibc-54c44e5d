
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  FileBarChart,
  History,
  Settings,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gerenciar Alunos",
      tooltip: "Cadastrar, editar e visualizar informações dos alunos",
      path: "/alunos",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: "Registrar Frequência",
      tooltip: "Fazer chamada e registrar presença dos alunos",
      path: "/frequencia",
      color: "bg-green-50 hover:bg-green-100"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Consultar Frequência",
      tooltip: "Consultar histórico de presença por data",
      path: "/consulta-frequencia",
      color: "bg-emerald-50 hover:bg-emerald-100"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Lançar Notas",
      tooltip: "Registrar e editar notas dos alunos",
      path: "/notas",
      color: "bg-purple-50 hover:bg-purple-100"
    },
    {
      icon: <History className="h-6 w-6" />,
      title: "Ver Histórico",
      tooltip: "Consultar histórico acadêmico dos alunos",
      path: "/historico",
      color: "bg-rose-50 hover:bg-rose-100"
    },
    {
      icon: <FileBarChart className="h-6 w-6" />,
      title: "Gerar Relatórios",
      tooltip: "Acessar relatórios e ferramentas administrativas",
      path: "/relatorios",
      color: "bg-amber-50 hover:bg-amber-100"
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <TooltipWrapper key={index} content={action.tooltip}>
            <Button
              variant="outline"
              className={`flex flex-col items-center gap-2 h-auto py-4 transition-all duration-200 ${action.color}`}
              onClick={() => navigate(action.path)}
            >
              {action.icon}
              <span>{action.title}</span>
            </Button>
          </TooltipWrapper>
        ))}
      </div>
    </Card>
  );
};
