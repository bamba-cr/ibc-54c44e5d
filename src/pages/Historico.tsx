
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, BookOpen } from "lucide-react";
import { buscarHistorico } from "@/services/historicoService";
import { useToast } from "@/components/ui/use-toast";

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const results = await buscarHistorico(searchTerm);
      setHistorico(results);
      
      if (results.length === 0) {
        toast({
          description: "Nenhum registro encontrado para este aluno.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar histórico",
        description: "Ocorreu um erro ao buscar o histórico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <BookOpen className="h-8 w-8" />
        Histórico Escolar
      </h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Digite o nome do aluno para buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !searchTerm.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Buscar</span>
          </Button>
        </div>
      </form>

      {historico.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {historico.map((item) => (
            <Card key={item.id} className="p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.student.name}</h3>
                  <span className="text-sm text-gray-500">{item.project.code}</span>
                </div>
                <p className="font-medium text-gray-700">{item.project.name}</p>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">
                    Período: {item.period}
                  </span>
                  <span className="font-semibold text-lg">
                    Nota: {item.grade?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                {item.observations && (
                  <p className="text-sm text-gray-600 mt-2 pt-2 border-t">
                    <strong>Observações:</strong> {item.observations}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historico;
