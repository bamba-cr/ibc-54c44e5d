import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Relatorios = () => {
  const [selectedProject, setSelectedProject] = useState("");

  const mockData = [
    {
      id: 1,
      name: "João Silva",
      project: "Capoeira",
      frequency: "85%",
      grade: "8.5",
      status: "Ativo",
    },
    {
      id: 2,
      name: "Maria Santos",
      project: "Música",
      frequency: "92%",
      grade: "9.0",
      status: "Ativo",
    },
    // Add more mock data as needed
  ];

  const handleExport = () => {
    // Mock export functionality
    console.log("Exportando relatório...");
    alert("Relatório exportado com sucesso!");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Relatórios Gerenciais</h1>
        <Button onClick={handleExport}>Exportar Relatório</Button>
      </div>

      <div className="mb-6">
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Projetos</SelectItem>
            <SelectItem value="capoeira">Capoeira</SelectItem>
            <SelectItem value="musica">Música</SelectItem>
            <SelectItem value="danca">Dança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.project}</TableCell>
                <TableCell>{item.frequency}</TableCell>
                <TableCell>{item.grade}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Relatorios;