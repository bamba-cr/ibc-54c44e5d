import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, X, History, User, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExistingGradesTableProps {
  studentId: string;
  projectId: string;
}

interface Grade {
  id: string;
  subject: string;
  grade: number;
  period: string;
  observations: string | null;
  created_at: string;
}

export const ExistingGradesTable = ({ studentId, projectId }: ExistingGradesTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingGrade, setEditingGrade] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editObservations, setEditObservations] = useState("");

  const { data: grades, isLoading } = useQuery({
    queryKey: ["existing-grades", studentId, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", studentId)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Grade[];
    },
    enabled: !!(studentId && projectId),
  });

  const { data: studentName } = useQuery({
    queryKey: ["student-name", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("name")
        .eq("id", studentId)
        .single();
      
      if (error) throw error;
      return data.name;
    },
    enabled: !!studentId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ gradeId, newGrade, newObservations }: { 
      gradeId: string; 
      newGrade: number; 
      newObservations: string;
    }) => {
      const { error } = await supabase
        .from("grades")
        .update({ 
          grade: newGrade, 
          observations: newObservations,
          updated_at: new Date().toISOString()
        })
        .eq("id", gradeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["existing-grades", studentId, projectId] });
      queryClient.invalidateQueries({ queryKey: ["student-grades", studentId] });
      setEditingGrade(null);
      setEditValue("");
      setEditObservations("");
      toast({
        title: "Nota atualizada",
        description: "A nota foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a nota.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (grade: Grade) => {
    setEditingGrade(grade.id);
    setEditValue(grade.grade.toString());
    setEditObservations(grade.observations || "");
  };

  const cancelEdit = () => {
    setEditingGrade(null);
    setEditValue("");
    setEditObservations("");
  };

  const saveEdit = (gradeId: string) => {
    const newGrade = parseFloat(editValue);
    if (isNaN(newGrade) || newGrade < 0 || newGrade > 10) {
      toast({
        title: "Valor inválido",
        description: "A nota deve estar entre 0 e 10.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      gradeId,
      newGrade,
      newObservations: editObservations,
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 7) return "default";
    if (grade >= 5) return "secondary";
    return "destructive";
  };

  if (!studentId || !projectId) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Notas Registradas
          {studentName && (
            <Badge variant="outline" className="ml-2">
              <User className="h-3 w-3 mr-1" />
              {studentName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : grades && grades.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">{grade.subject}</TableCell>
                    <TableCell>{grade.period}</TableCell>
                    <TableCell>
                      {editingGrade === grade.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20"
                          autoFocus
                        />
                      ) : (
                        <Badge variant={getGradeColor(grade.grade)}>
                          {grade.grade.toFixed(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingGrade === grade.id ? (
                        <Input
                          value={editObservations}
                          onChange={(e) => setEditObservations(e.target.value)}
                          placeholder="Observações..."
                          className="min-w-[200px]"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {grade.observations || "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(grade.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingGrade === grade.id ? (
                        <div className="flex gap-1 justify-end">
                          <TooltipWrapper content="Salvar alterações na nota">
                            <Button
                              size="sm"
                              onClick={() => saveEdit(grade.id)}
                              disabled={updateMutation.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </TooltipWrapper>
                          <TooltipWrapper content="Cancelar edição">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={updateMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipWrapper>
                        </div>
                      ) : (
                        <TooltipWrapper content="Editar esta nota">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(grade)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipWrapper>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma nota registrada para este aluno neste projeto.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};