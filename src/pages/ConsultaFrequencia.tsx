
import { useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { buscarFrequenciaPorData, type FrequenciaResponse } from "@/services/historicoService";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Project = {
  id: string;
  name: string;
  code: string;
};

const ConsultaFrequencia = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const { toast } = useToast();

  // Busca projetos disponíveis
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Buscando lista de projetos...");
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code")
        .order("name");
      
      if (error) {
        console.error("Erro ao buscar projetos:", error);
        throw error;
      }
      console.log("Projetos encontrados:", data?.length || 0);
      return data || [];
    },
  });

  // Busca frequência por data e projeto
  const { 
    data: frequencia = [], 
    isLoading, 
    refetch, 
    isError, 
    error 
  } = useQuery<FrequenciaResponse[]>({
    queryKey: ["frequencia", selectedDate, selectedProject],
    queryFn: async () => {
      if (!selectedDate) return [];
      console.log("Buscando frequência com os seguintes parâmetros:");
      console.log("- Data:", format(selectedDate, "yyyy-MM-dd"));
      
      const results = await buscarFrequenciaPorData(format(selectedDate, "yyyy-MM-dd"));
      console.log("Resultados da consulta:", results);
      return results;
    },
    enabled: false,
  });

  const handleSearch = async () => {
    if (!selectedDate) {
      toast({
        description: "Selecione uma data para consultar.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProject) {
      toast({
        description: "Selecione um projeto para consultar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchTriggered(true);
      await refetch();
    } catch (err) {
      console.error("Erro na consulta de frequência:", err);
      toast({
        description: "Erro ao buscar dados de frequência.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 min-h-screen bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <CalendarIcon className="h-8 w-8 text-primary" />
          Consulta de Frequência
        </h1>

        <Card className="p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projeto
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} ({project.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy")
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isLoading || !selectedProject || !selectedDate}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Consultando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Consultar Frequência
              </>
            )}
          </Button>
        </Card>

        <AnimatePresence>
          {frequencia.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-4 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Frequência do dia {selectedDate && format(selectedDate, "dd/MM/yyyy")}
                </h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frequencia.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.student.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.status === "presente" ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="text-green-700">Presente</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="text-red-700">Ausente</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.observations || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Erro ao consultar frequência</p>
            <p className="text-sm">{error instanceof Error ? error.message : "Tente novamente mais tarde."}</p>
          </motion.div>
        )}

        {frequencia.length === 0 && !isLoading && searchTriggered && !isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Nenhum registro encontrado para esta data</p>
            <p className="text-sm">Tente consultar outra data ou projeto</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ConsultaFrequencia;
