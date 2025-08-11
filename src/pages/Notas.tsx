import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const subjects = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
] as const;

const allowedPeriods = [
  "1º Bimestre",
  "2º Bimestre",
  "3º Bimestre",
  "4º Bimestre",
  "1º Semestre",
  "2º Semestre",
  "Anual",
] as const;

interface GradeEntry {
  subject: string;
  grade: string;
}

const Notas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [period, setPeriod] = useState("");
  const [observations, setObservations] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [grades, setGrades] = useState<GradeEntry[]>(
    subjects.map((subject) => ({ subject, grade: "" }))
  );
  const [bulkGrade, setBulkGrade] = useState("");

  // Fetch projects from Supabase
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch students for selected project
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      
      const { data, error } = await supabase
        .from("student_projects")
        .select(`
          students(id, name)
        `)
        .eq("project_id", selectedProject);

      if (error) throw error;

      return data?.map((entry) => entry.students) || [];
    },
    enabled: !!selectedProject,
  });

  // Mutation to save grades
  const saveMutation = useMutation({
    mutationFn: async (gradeData: {
      studentId: string;
      projectId: string;
      period: string;
      grades: GradeEntry[];
      observations: string;
    }) => {
      const gradesToInsert = gradeData.grades
        .filter((g) => g.grade !== "" && !isNaN(Number(g.grade)))
        .map((g) => ({
          student_id: gradeData.studentId,
          project_id: gradeData.projectId,
          subject: g.subject,
          grade: parseFloat(g.grade),
          period: gradeData.period,
          observations: gradeData.observations,
        }));

      if (gradesToInsert.length === 0) {
        throw new Error("Nenhuma nota válida para salvar");
      }

      const { error } = await supabase.from("grades").insert(gradesToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notas salvas!",
        description: "As notas foram registradas com sucesso.",
      });
      // Reset form
      setGrades(subjects.map((subject) => ({ subject, grade: "" })));
      setObservations("");
      setPeriod("");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades", selectedStudent] });
      queryClient.invalidateQueries({ queryKey: ["performanceData", selectedStudent, selectedProject] });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      console.error("Error saving grades:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar as notas. Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleGradeChange = (subject: string, value: string) => {
    const numericValue = value === "" ? "" : Number(value);
    if (numericValue === "" || (numericValue >= 0 && numericValue <= 10)) {
      setGrades((prev) =>
        prev.map((grade) =>
          grade.subject === subject ? { ...grade, grade: value } : grade
        )
      );
    } else {
      toast({
        title: "Valor inválido",
        description: "A nota deve estar entre 0 e 10",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    if (!selectedStudent) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione um aluno",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedProject) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione um projeto",
        variant: "destructive",
      });
      return false;
    }

    if (!period) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o período",
        variant: "destructive",
      });
      return false;
    }

    // Validate all grades
    const invalidGrades = grades.filter(
      (grade) => grade.grade !== "" && (Number(grade.grade) < 0 || Number(grade.grade) > 10)
    );

    if (invalidGrades.length > 0) {
      toast({
        title: "Notas inválidas",
        description: "Todas as notas devem estar entre 0 e 10",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const applyToAll = () => {
    const n = bulkGrade === "" ? NaN : Number(bulkGrade);
    if (isNaN(n) || n < 0 || n > 10) {
      toast({
        title: "Valor inválido",
        description: "A nota deve estar entre 0 e 10",
        variant: "destructive",
      });
      return;
    }
    setGrades(subjects.map((subject) => ({ subject, grade: bulkGrade })));
    toast({ title: "Notas aplicadas", description: "Valor aplicado a todas as disciplinas." });
  };

  const clearAll = () => {
    setGrades(subjects.map((subject) => ({ subject, grade: "" })));
    setBulkGrade("");
    toast({ title: "Notas limpas", description: "Todos os campos foram limpos." });
  };

  const loadLastGrades = async () => {
    if (!selectedStudent || !selectedProject) {
      toast({ title: "Selecione aluno e projeto", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("grades")
      .select("subject, grade, created_at")
      .eq("student_id", selectedStudent)
      .eq("project_id", selectedProject)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Erro ao carregar últimas notas:", error);
      toast({ title: "Erro ao carregar", description: "Não foi possível carregar últimas notas.", variant: "destructive" });
      return;
    }
    if (!data || data.length === 0) {
      toast({ title: "Sem registros", description: "Nenhuma nota anterior encontrada." });
      return;
    }
    const latest = new Map<string, string>();
    for (const row of data as any[]) {
      if (!latest.has(row.subject) && row.grade !== null) {
        latest.set(row.subject, String(row.grade));
      }
    }
    setGrades(subjects.map((subject) => ({ subject, grade: latest.get(subject) ?? "" })));
    toast({ title: "Notas carregadas", description: "Últimos valores aplicados." });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setShowConfirmDialog(true);
  };

  const confirmSubmit = () => {
    saveMutation.mutate({
      studentId: selectedStudent,
      projectId: selectedProject,
      period,
      grades,
      observations,
    });
    setShowConfirmDialog(false);
  };

  return (
    <div className="container mx-auto p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6">Boletim Escolar</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Projeto</label>
              <Select
                value={selectedProject}
                onValueChange={(value) => {
                  setSelectedProject(value);
                  setSelectedStudent(""); // Reset student when project changes
                }}
                disabled={isLoadingProjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>
                      Carregando projetos...
                    </SelectItem>
                  ) : (
                    projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Aluno</label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={!selectedProject || isLoadingStudents}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedProject 
                      ? "Selecione um projeto primeiro" 
                      : "Selecione o aluno"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingStudents ? (
                    <SelectItem value="loading" disabled>
                      Carregando alunos...
                    </SelectItem>
                  ) : (
                    students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {allowedPeriods.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Opções: 1º/2º/3º/4º Bimestre, 1º/2º Semestre, Anual</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <h2 className="text-lg font-semibold">Notas por Disciplina</h2>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="Nota p/ todos"
                    value={bulkGrade}
                    onChange={(e) => setBulkGrade(e.target.value)}
                    className="w-36"
                  />
                  <Button type="button" variant="secondary" onClick={applyToAll} disabled={bulkGrade === ""}>
                    Aplicar a todos
                  </Button>
                  <Button type="button" variant="outline" onClick={clearAll}>
                    Limpar
                  </Button>
                  <Button
                    type="button"
                    onClick={loadLastGrades}
                    disabled={!selectedStudent || !selectedProject}
                  >
                    Carregar últimas
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Média parcial: {(() => {
                  const nums = grades.map((g) => Number(g.grade)).filter((n) => !isNaN(n));
                  const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "--";
                  return avg;
                })()} ({grades.filter((g) => g.grade !== "").length}/{grades.length})
              </div>
              {grades.map((grade) => (
                <div key={grade.subject} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium">{grade.subject}</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="0-10"
                    value={grade.grade}
                    onChange={(e) => handleGradeChange(grade.subject, e.target.value)}
                    className="w-24"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <Textarea
                placeholder="Observações adicionais sobre o desempenho do aluno"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Boletim"
            )}
          </Button>
        </form>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Registro</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a registrar as notas para este aluno. 
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Notas;