import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileSpreadsheet, Calendar, BookOpen } from "lucide-react";
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
          <UserPlus className="h-6 w-6" />
          <span>Novo Aluno</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/notas")}
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span>Lançar Notas</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/frequencia")}
        >
          <Calendar className="h-6 w-6" />
          <span>Frequência</span>
        </Button>
        <Button
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
          onClick={() => navigate("/relatorios")}
        >
          <BookOpen className="h-6 w-6" />
          <span>Relatórios</span>
        </Button>
      </div>
    </Card>
  );
};