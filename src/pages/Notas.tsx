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

interface GradeEntry {
  subject: string;
  grade: string;
}

const subjects = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
] as const;

const projects = [
  { id: "capoeira", label: "Capoeira (Roda do Bem)" },
  { id: "futebol", label: "Futebol (Show de Bola)" },
  { id: "judo", label: "Judô (Campeões do Futuro)" },
  { id: "musica", label: "Música (CulturArt)" },
  { id: "informatica", label: "Informática (Conecte-se)" },
  { id: "zumba", label: "Zumba em Movimento" },
  { id: "reforco", label: "Reforço Escolar (Mentes Brilhantes)" },
];

// Mock data - substituir com dados reais do backend
const studentsByProject = {
  capoeira: [
    { id: "1", name: "João Silva" },
    { id: "2", name: "Maria Santos" },
  ],
  futebol: [
    { id: "3", name: "Pedro Oliveira" },
    { id: "4", name: "Ana Souza" },
  ],
  judo: [
    { id: "5", name: "Lucas Ferreira" },
    { id: "6", name: "Julia Costa" },
  ],
  musica: [
    { id: "7", name: "Carlos Mendes" },
    { id: "8", name: "Paula Lima" },
  ],
  informatica: [
    { id: "9", name: "Roberto Santos" },
    { id: "10", name: "Clara Silva" },
  ],
  zumba: [
    { id: "11", name: "Fernanda Lima" },
    { id: "12", name: "Ricardo Souza" },
  ],
  reforco: [
    { id: "13", name: "Patricia Oliveira" },
    { id: "14", name: "Marcos Costa" },
  ],
};

const Notas = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [period, setPeriod] = useState("");
  const [observations, setObservations] = useState("");
  const [grades, setGrades] = useState<GradeEntry[]>(
    subjects.map((subject) => ({ subject, grade: "" }))
  );

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

    // Mock API call - substituir com atualização real no banco de dados
    console.log({
      project: selectedProject,
      student: selectedStudent,
      period,
      grades,
      observations,
    });

    toast({
      title: "Sucesso!",
      description: "Notas registradas/alteradas com sucesso!",
    });

    // Reset form
    setGrades(subjects.map((subject) => ({ subject, grade: "" })));
    setObservations("");
    setPeriod("");
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
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.label}
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
                disabled={!selectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProject &&
                    studentsByProject[selectedProject as keyof typeof studentsByProject]?.map((student) => (
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

          <Button type="submit" className="w-full">
            Salvar Boletim
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Notas;