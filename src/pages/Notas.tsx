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
      const gradePromises = gradeData.grades.map((grade) =>
        supabase.from("grades").insert({
          student_id: gradeData.studentId,
          project_id: gradeData.projectId,
          subject: grade.subject,
          grade: grade.grade ? parseFloat(grade.grade) : null,
          period: gradeData.period,
          observations: gradeData.observations,
        })
      );

      await Promise.all(gradePromises);
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
    },
    onError: (error) => {
      console.error("Error saving grades:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as notas. Por favor, tente novamente.",
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
              <Input
                type="text"
                placeholder="Ex: 2024.1"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notas por Disciplina</h2>
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