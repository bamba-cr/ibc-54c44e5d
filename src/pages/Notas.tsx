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
        .from("students")
        .select(`
          id,
          name,
          student_projects!inner(project_id)
        `)
        .eq("student_projects.project_id", selectedProject)
        .order("name");
      
      if (error) throw error;
      return data;
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
        title: "Sucesso!",
        description: "Notas registradas com sucesso!",
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
        title: "Erro",
        description: "Erro ao salvar as notas. Por favor, tente novamente.",
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all grades
    const invalidGrades = grades.filter(
      (grade) => grade.grade !== "" && (Number(grade.grade) < 0 || Number(grade.grade) > 10)
    );

    if (invalidGrades.length > 0) {
      toast({
        title: "Erro",
        description: "Todas as notas devem estar entre 0 e 10",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStudent) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um aluno",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um projeto",
        variant: "destructive",
      });
      return;
    }

    if (!period) {
      toast({
        title: "Erro",
        description: "Por favor, informe o período",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      studentId: selectedStudent,
      projectId: selectedProject,
      period,
      grades,
      observations,
    });
  };

  return (
    <div className="container mx-auto p-6">
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingProjects &&
                    projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
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
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {!isLoadingStudents &&
                    students?.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
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
            {saveMutation.isPending ? "Salvando..." : "Salvar Boletim"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Notas;