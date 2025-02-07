
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  CalendarCheck, 
  GraduationCap, 
  FileBarChart,
  History,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/alunos")}
        >
          <Users className="h-6 w-6" />
          <span>Gerenciar Alunos</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/frequencia")}
        >
          <CalendarCheck className="h-6 w-6" />
          <span>Registrar Frequência</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/notas")}
        >
          <GraduationCap className="h-6 w-6" />
          <span>Lançar Notas</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/relatorios")}
        >
          <FileBarChart className="h-6 w-6" />
          <span>Gerar Relatórios</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/historico")}
        >
          <History className="h-6 w-6" />
          <span>Ver Histórico</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/configuracoes")}
        >
          <Settings className="h-6 w-6" />
          <span>Configurações</span>
        </Button>
      </div>
    </Card>
  );
};
