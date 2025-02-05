import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Loader2, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { AdminManagement } from "@/components/reports/AdminManagement";
import { DataExport } from "@/components/reports/DataExport";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

type Student = Database['public']['Tables']['students']['Row'];

const Relatorios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState({
    name: "",
    age: "",
    city: "",
    birth_date: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: students, isLoading, refetch: fetchStudents } = useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      let query = supabase.from("students").select("*");

      if (filters.name) query = query.ilike("name", `%${filters.name}%`);
      if (filters.age) query = query.eq("age", parseInt(filters.age));
      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.birth_date) query = query.eq("birth_date", filters.birth_date);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const paginatedStudents = students?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [events, setEvents] = useState([
    {
      date: new Date(),
      title: "Reunião Pedagógica",
      type: "meeting" as const
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      title: "Entrega de Notas",
      type: "deadline" as const
    }
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddEvent = (newEvent: typeof events[0]) => {
    setEvents([...events, newEvent]);
    toast({
      title: "Evento adicionado",
      description: `\"${newEvent.title}\" foi adicionado ao calendário.`
    });
  };

  const handleEditModalOpen = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
        className: "bg-green-50 border-green-200",
      });
      
      fetchStudents();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o aluno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const validateStudentData = (data: Partial<Student>) => {
    if (!data.name) return "O nome é obrigatório.";
    if (data.age && (data.age < 0 || data.age > 120)) return "Idade inválida.";
    if (data.birth_date && isNaN(Date.parse(data.birth_date))) return "Data de nascimento inválida.";
    return null;
  };

  const handleEditStudent = async (studentId: string, updatedData: Partial<Student>) => {
    const validationError = validateStudentData(updatedData);
    if (validationError) {
      toast({
        title: "Erro na Validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("students")
        .update(updatedData)
        .eq("id", studentId);

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "As informações do aluno foram atualizadas com sucesso.",
        className: "bg-green-50 border-green-200",
      });
      
      fetchStudents();
      handleEditModalClose();
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar as informações do aluno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

  const totalPages = Math.ceil((students?.length || 0) / itemsPerPage);

  const exportToPdf = (data: any[], title: string) => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    data.forEach((item, index) => {
      doc.text(`${index + 1}. ${JSON.stringify(item)}`, 10, 20 + index * 10);
    });
    doc.save(`${title}.pdf`);
  };

  const handleExport = (category: string) => {
    let dataToExport = [];
    switch (category) {
      case "students":
        dataToExport = students || [];
        break;
      case "events":
        dataToExport = events;
        break;
      default:
        dataToExport = [...(students || []), ...events];
    }

    exportToPdf(dataToExport, category);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-primary"
      >
        Relatórios e Gestão
      </motion.h1>
      
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px]">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="admin">Administração</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendário de atividades */}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Alunos</CardTitle>
              <CardDescription>Pesquise e edite informações dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <Input
                    placeholder="Nome"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                  <Input
                    placeholder="Idade"
                    value={filters.age}
                    onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                  />
                  <Input
                    placeholder="Cidade"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                  <Input
                    placeholder="Data de Nascimento"
                    value={filters.birth_date}
                    onChange={(e) => setFilters({ ...filters, birth_date: e.target.value })}
                    type="date"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ name: "", age: "", city: "", birth_date: "" })}
                  className="w-full md:w-auto"
                >
                  Limpar Filtros
                </Button>
                
                {/* Paginação e listagem de alunos */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="w-full md:w-auto"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="w-full md:w-auto"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-4">
            <Button onClick={() => handleExport("students")}>Exportar Alunos</Button>
            <Button onClick={() => handleExport("events")}>Exportar Eventos</Button>
            <Button onClick={() => handleExport("all")}>Exportar Todos</Button>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
