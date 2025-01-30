import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

// Mock data - substituir por dados reais do backend
const mockHistory = {
  student: {
    name: "João Silva",
    id: "12345",
  },
  projects: [
    {
      name: "Capoeira",
      period: "2023.2",
      status: "Concluído",
      attendance: "85%",
      grade: "8.5",
    },
    {
      name: "Música",
      period: "2024.1",
      status: "Em andamento",
      attendance: "90%",
      grade: "9.0",
    },
  ],
};

export default function HistoricoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentHistory, setStudentHistory] = useState(mockHistory);

  const handleSearch = () => {
    // Implementar busca real
    console.log("Buscando histórico...", searchTerm);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Histórico de Participação</h1>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Buscar por nome ou matrícula"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          Buscar
        </Button>
      </div>

      {studentHistory && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{studentHistory.student.name}</CardTitle>
              <CardDescription>Matrícula: {studentHistory.student.id}</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {studentHistory.projects.map((project, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={project.status === "Concluído" ? "text-green-600" : "text-blue-600"}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequência:</span>
                      <span>{project.attendance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Média Final:</span>
                      <span>{project.grade}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}