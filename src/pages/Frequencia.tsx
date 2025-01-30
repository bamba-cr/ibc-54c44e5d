import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const projects = [
  { id: "capoeira", label: "Capoeira" },
  { id: "futebol", label: "Futebol" },
  { id: "judo", label: "Judô" },
  { id: "musica", label: "Música" },
  { id: "informatica", label: "Informática" },
  { id: "zumba", label: "Zumba" },
  { id: "reforco", label: "Reforço Escolar" },
];

// Mock data - em produção, isso viria do banco de dados
const mockStudents = [
  { id: 1, name: "João Silva", status: "presente" },
  { id: 2, name: "Maria Santos", status: "ausente" },
  { id: 3, name: "Pedro Oliveira", status: "presente" },
];

const Frequencia = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [attendance, setAttendance] = useState<
    { id: number; name: string; status: string }[]
  >([]);

  const handleProjectSelect = (value: string) => {
    setSelectedProject(value);
    // Em produção, isso seria uma chamada à API para buscar os alunos do projeto
    setAttendance(mockStudents);
  };

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmit = () => {
    console.log("Frequência registrada:", {
      project: selectedProject,
      date: new Date().toISOString(),
      attendance,
    });

    toast({
      title: "Sucesso!",
      description: "Frequência registrada com sucesso!",
    });

    // Resetar o formulário
    setSelectedProject("");
    setAttendance([]);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Registro de Frequência</h1>

      <div className="max-w-md mb-8">
        <Select value={selectedProject} onValueChange={handleProjectSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um projeto" />
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

      {attendance.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead>Presença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <RadioGroup
                      value={student.status}
                      onValueChange={(value) =>
                        handleAttendanceChange(student.id, value)
                      }
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="presente" id={`present-${student.id}`} />
                        <Label htmlFor={`present-${student.id}`}>Presente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ausente" id={`absent-${student.id}`} />
                        <Label htmlFor={`absent-${student.id}`}>Ausente</Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-8">
            <Button onClick={handleSubmit}>Registrar Frequência</Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Frequencia;