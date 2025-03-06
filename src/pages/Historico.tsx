
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, BookOpen, Calendar, School } from "lucide-react";
import { buscarHistorico, type HistoricoResponse } from "@/services/historicoService";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Configuração do useQuery com sintaxe atualizada
  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["historico", searchTerm],
    queryFn: () => buscarHistorico(searchTerm),
    enabled: false, // A busca é acionada manualmente via refetch
    meta: {
      onError: (error: Error) => {
        console.error("Erro na busca:", error);
        toast({
          description: "Erro ao buscar histórico. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  });

  // Corrigindo o tipo de dados para HistoricoResponse[]
  const historico: HistoricoResponse[] = data || [];

  // Função para lidar com a busca
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação do campo de busca
    if (!searchTerm.trim()) {
      toast({
        description: "Por favor, insira um nome válido para buscar.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Buscando histórico para:", searchTerm);
      await refetch(); // Aciona a busca manualmente
    } catch (err) {
      console.error("Erro inesperado durante a busca:", err);
      toast({
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar notas
  const formatGrade = (grade: number): string => {
    if (isNaN(grade)) return "N/A";
    return grade.toFixed(1).replace('.', ',');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cabeçalho simplificado */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-primary" />
              Histórico Escolar
            </h1>
            <p className="text-gray-500 mt-2">
              Consulte o histórico acadêmico dos alunos por nome
            </p>
          </div>

          {/* Formulário de Busca com design minimalista */}
          <Card className="p-5 mb-8 shadow-sm border-0 bg-white rounded-xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-none h-12 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="h-12 px-6 rounded-lg font-normal text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Resultados da Busca */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
              </motion.div>
            )}

            {isError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12 text-gray-500"
              >
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Erro ao buscar histórico</p>
                <p className="text-sm mt-2">{error instanceof Error ? error.message : "Tente novamente mais tarde."}</p>
              </motion.div>
            )}

            {historico.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-5 md:grid-cols-2"
              >
                {historico.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                  >
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-0 bg-white rounded-xl">
                      <div className="border-l-4 border-primary h-full p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <School className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-base font-medium text-gray-800">{item.student.name}</h3>
                              <p className="text-xs text-gray-500">{item.project.code}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center">
                            <span className="font-medium text-lg text-primary">{formatGrade(item.grade)}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.project.name}</p>
                          
                          <div className="flex items-center gap-1 mt-3 text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">{item.period}</span>
                          </div>
                        </div>

                        {item.observations && (
                          <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                            <p className="text-xs text-gray-500 mb-1">Observações:</p>
                            <p className="text-sm">{item.observations}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {historico.length === 0 && !isLoading && searchTerm && !isError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-gray-50/50 rounded-xl"
              >
                <Search className="h-10 w-10 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium text-gray-600">Nenhum registro encontrado</p>
                <p className="text-sm text-gray-500 mt-2">Tente buscar por outro nome</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Historico;
