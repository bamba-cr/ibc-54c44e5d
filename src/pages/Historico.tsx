import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buscarHistorico } from "@/services/historicoService";
import { supabase } from "@/lib/supabase";

// Função para buscar o histórico de um aluno pelo nome ou matrícula
export async function buscarHistorico(searchTerm: string) {
  if (!searchTerm) return [];

  const { data, error } = await supabase
    .from("grades")
    .select(
      `id, period, frequency, grade, status, 
       student:students(name), 
       project:projects(name)`
    )
    .ilike("student.name", `%${searchTerm}%`);

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }

  return data || [];
}
const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const data = await buscarHistorico(searchTerm);
      setHistorico(data);

      if (data.length === 0) {
        setErro("Nenhum histórico encontrado.");
      }
    } catch (error) {
      setErro("Erro ao buscar os dados.");
    } finally {
      setLoading(false);
    }
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
          <Button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
      </form>

      {erro && <p className="text-red-500 text-center mt-4">{erro}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {historico.map((item) => (
          <Card key={item.id} className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.project.name}</h3>
            <div className="space-y-2 text-sm">
              <p>Aluno: {item.student.name}</p>
              <p>Período: {item.period}</p>
              <p>Frequência: {item.frequency}%</p>
              <p>Nota Final: {item.grade}</p>
              <p>Status: {item.status}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Historico;
