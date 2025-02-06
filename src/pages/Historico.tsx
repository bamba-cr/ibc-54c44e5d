
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

  const { data: historico = [], isLoading, refetch } = useQuery({
    queryKey: ["historico", searchTerm],
    queryFn: () => buscarHistorico(searchTerm),
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast({
        description: "Digite um nome para buscar.",
        variant: "destructive",
      });
      return;
    }
    
    refetch();
  };

  const formatGrade = (grade: number): string => {
    return grade.toFixed(1).replace('.', ',');
  };

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Histórico Escolar
        </h1>

        <Card className="p-6 mb-8 shadow-lg">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Digite o nome do aluno para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !searchTerm.trim()}
              className="min-w-[120px]"
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

        <AnimatePresence>
          {historico.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:grid-cols-2"
            >
              {historico.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                >
                  <Card className="p-4 shadow hover:shadow-md transition-shadow duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <School className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-semibold">{item.student.name}</h3>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{item.project.code}</span>
                      </div>
                      
                      <p className="font-medium text-gray-700">{item.project.name}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{item.period}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">Nota</span>
                          <p className="text-lg font-semibold text-primary">
                            {formatGrade(item.grade)}
                          </p>
                        </div>
                      </div>

                      {item.observations && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          <p className="font-medium mb-1">Observações:</p>
                          <p>{item.observations}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {historico.length === 0 && !isLoading && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Nenhum registro encontrado para "{searchTerm}"</p>
            <p className="text-sm">Tente buscar por outro nome</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Historico;
