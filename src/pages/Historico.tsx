import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock API call
    setHistorico([
      {
        id: 1,
        project: "Capoeira",
        period: "2024.1",
        frequency: "85%",
        grade: "8.5",
        status: "Concluído",
      },
      {
        id: 2,
        project: "Música",
        period: "2023.2",
        frequency: "92%",
        grade: "9.0",
        status: "Concluído",
      },
      // Add more mock data as needed
    ]);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Histórico de Participação</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Buscar por nome ou matrícula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {historico.map((item) => (
          <Card key={item.id} className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.project}</h3>
            <div className="space-y-2 text-sm">
              <p>Período: {item.period}</p>
              <p>Frequência: {item.frequency}</p>
              <p>Nota Final: {item.grade}</p>
              <p>Status: {item.status}</p>
            </div>
          </Card>
        ))}
      </div>

      {historico.length === 0 && searchTerm && (
        <p className="text-center text-gray-500 mt-6">
          Nenhum histórico encontrado para esta busca.
        </p>
      )}
    </div>
  );
};

export default Historico;