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

const Notas = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [grade, setGrade] = useState("");
  const [period, setPeriod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate grade
    const numericGrade = parseFloat(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      toast({
        title: "Erro",
        description: "A nota deve ser um número entre 0 e 10",
        variant: "destructive",
      });
      return;
    }

    // Mock API call
    console.log({
      student: selectedStudent,
      project: selectedProject,
      grade: numericGrade,
      period,
    });

    toast({
      title: "Sucesso!",
      description: "Nota registrada com sucesso",
    });

    // Reset form
    setGrade("");
    setPeriod("");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Registro de Notas</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aluno</label>
            <Select
              value={selectedStudent}
              onValueChange={setSelectedStudent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">João Silva</SelectItem>
                <SelectItem value="2">Maria Santos</SelectItem>
                <SelectItem value="3">Pedro Oliveira</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Projeto</label>
            <Select
              value={selectedProject}
              onValueChange={setSelectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="capoeira">Capoeira</SelectItem>
                <SelectItem value="musica">Música</SelectItem>
                <SelectItem value="danca">Dança</SelectItem>
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

          <div>
            <label className="block text-sm font-medium mb-1">Nota</label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="Digite a nota (0-10)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Registrar Nota
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Notas;