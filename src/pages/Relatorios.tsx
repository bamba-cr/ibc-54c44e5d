import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";

// Mock data - substituir por dados reais do backend
const mockData = [
  {
    id: "1",
    name: "João Silva",
    project: "Capoeira",
    attendance: "85%",
    grade: "8.5",
  },
  {
    id: "2",
    name: "Maria Santos",
    project: "Música",
    attendance: "90%",
    grade: "9.0",
  },
];

export default function RelatoriosPage() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  const handleExport = () => {
    // Implementar exportação para Excel/PDF
    console.log("Exportando relatório...");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Relatórios Gerenciais</h1>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="mb-6">
        <Select onValueChange={setSelectedProject} value={selectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os projetos</SelectItem>
            <SelectItem value="capoeira">Capoeira</SelectItem>
            <SelectItem value="futebol">Futebol</SelectItem>
            <SelectItem value="judo">Judô</SelectItem>
            <SelectItem value="musica">Música</SelectItem>
            <SelectItem value="informatica">Informática</SelectItem>
            <SelectItem value="zumba">Zumba</SelectItem>
            <SelectItem value="reforco">Reforço Escolar</SelectItem>
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
              <TableHead>Média</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.project}</TableCell>
                <TableCell>{item.attendance}</TableCell>
                <TableCell>{item.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}