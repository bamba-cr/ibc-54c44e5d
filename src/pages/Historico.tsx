
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Search, BookOpen, Calendar, School, Eye } from "lucide-react";
import { buscarHistorico, type HistoricoResponse } from "@/services/historicoService";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { StudentProfile } from "@/components/student/StudentProfile";
import { useIsMobile } from "@/hooks/use-mobile";

const Historico = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      toast({
        title: "Busca realizada",
        description: "Histórico atualizado com sucesso!",
      });
    } catch (err) {
      console.error("Erro inesperado durante a busca:", err);
      toast({
        title: "Erro na busca",
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
    <div className="min-h-screen bg-background">
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'max-w-full' : 'max-w-5xl'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Cabeçalho com design harmonioso e novas cores */}
          <div className={`mb-4 ${isMobile ? 'text-center' : 'text-center sm:text-left'}`}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-primary flex items-center gap-2 ${isMobile ? 'justify-center' : 'sm:inline-flex'} tracking-tight`}>
              <BookOpen className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-secondary`} />
              Histórico Escolar
            </h1>
            <p className={`text-muted-foreground mt-1.5 max-w-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Consulte o histórico acadêmico dos alunos por nome
            </p>
          </div>

          {/* Formulário de Busca com design aprimorado */}
          <Card className={`${isMobile ? 'p-3' : 'p-5'} mb-6 shadow-md border-0 bg-card rounded-xl overflow-hidden`}>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                <Input
                  type="text"
                  placeholder="Nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 bg-muted/50 border-border ${isMobile ? 'h-10' : 'h-11'} rounded-lg focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm`}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className={`${isMobile ? 'h-10 px-4' : 'h-11 px-5'} rounded-lg shadow-sm transition-all duration-200 font-medium`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isMobile ? "..." : "Buscando..."}
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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </motion.div>
            )}

            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 text-gray-500 font-poppins"
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
                className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}
              >
                {historico.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-card rounded-xl group border-l-4 border-l-secondary border-t-0 border-r-0 border-b-0">
                      <div className={`${isMobile ? 'p-3' : 'p-5'} space-y-3`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
                              <School className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                            </div>
                            <div>
                              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-foreground group-hover:text-primary transition-colors duration-200`}>{item.student.name}</h3>
                              <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-0.5`}>{item.project.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`bg-secondary/10 rounded-full ${isMobile ? 'h-10 w-10' : 'h-12 w-12'} flex items-center justify-center shadow-sm`}>
                              <span className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} text-primary`}>{formatGrade(item.grade)}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedStudentId(item.student.id)}
                              className={`${isMobile ? 'h-8 w-8 p-1' : 'h-9 w-9 p-2'}`}
                            >
                              <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            </Button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>{item.project.name}</p>
                          
                          <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
                            <Calendar className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-primary/70`} />
                            <span className={`${isMobile ? 'text-xs' : 'text-xs'}`}>{item.period}</span>
                          </div>
                        </div>

                        {item.observations && (
                          <div className="pt-3 border-t border-border text-sm text-muted-foreground">
                            <p className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-muted-foreground mb-1`}>Observações:</p>
                            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{item.observations}</p>
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
                className={`text-center ${isMobile ? 'py-12' : 'py-16'} bg-muted/30 rounded-xl`}
              >
                <div className="bg-card inline-flex p-4 rounded-full mb-3 shadow-sm">
                  <Search className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground`}>Nenhum registro encontrado</p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1.5 max-w-md mx-auto text-muted-foreground`}>Tente buscar por outro nome</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Modal do perfil do estudante */}
        {selectedStudentId && (
          <StudentProfile
            studentId={selectedStudentId}
            isOpen={!!selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Historico;
