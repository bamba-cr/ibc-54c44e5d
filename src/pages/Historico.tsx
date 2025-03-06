
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

  const { data, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["historico", searchTerm],
    queryFn: () => buscarHistorico(searchTerm),
    enabled: false, // A busca é acionada manualmente via refetch
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Cabeçalho com design harmônico */}
          <div className="mb-4 text-center sm:text-left">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2 sm:inline-flex">
              <BookOpen className="h-7 w-7 text-primary" />
              Histórico Escolar
            </h1>
            <p className="text-gray-500 mt-1.5 max-w-lg">
              Consulte o histórico acadêmico dos alunos por nome
            </p>
          </div>

          {/* Formulário de Busca com design refinado */}
          <Card className="p-5 mb-6 shadow-sm border-0 bg-white rounded-xl overflow-hidden">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50/70 border-none h-11 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/60 shadow-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="h-11 px-5 rounded-lg shadow-sm transition-all duration-200 font-medium"
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
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary/70" />
              </motion.div>
            )}

            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 text-gray-500"
              >
                <div className="bg-gray-50 inline-flex p-4 rounded-full mb-3">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700">Erro ao buscar histórico</p>
                <p className="text-sm mt-1 max-w-md mx-auto">{error instanceof Error ? error.message : "Tente novamente mais tarde."}</p>
              </motion.div>
            )}

            {historico.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {historico.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md border-0 bg-white rounded-xl group">
                      <div className="border-l-4 border-primary h-full p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                              <School className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary transition-colors duration-200">{item.student.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">{item.project.code}</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center shadow-sm">
                            <span className="font-semibold text-lg text-primary">{formatGrade(item.grade)}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-sm font-medium text-gray-700">{item.project.name}</p>
                          
                          <div className="flex items-center gap-1.5 mt-3 text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-xs">{item.period}</span>
                          </div>
                        </div>

                        {item.observations && (
                          <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
                            <p className="text-xs font-medium text-gray-500 mb-1">Observações:</p>
                            <p className="text-sm text-gray-600">{item.observations}</p>
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
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-gray-50/70 rounded-xl"
              >
                <div className="bg-white inline-flex p-4 rounded-full mb-3 shadow-sm">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-base font-medium text-gray-600">Nenhum registro encontrado</p>
                <p className="text-sm text-gray-500 mt-1.5">Tente buscar por outro nome</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Historico;
