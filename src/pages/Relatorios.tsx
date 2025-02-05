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
import { motion, AnimatePresence } from "framer-motion";
import { AdminManagement } from "@/components/reports/AdminManagement";
import { DataExport } from "@/components/reports/DataExport";
import type { Database } from "@/integrations/supabase/types";

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

  const handleFetchStudents = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fetchStudents();
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
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Calendário de Atividades</CardTitle>
                  <CardDescription>Visualize e gerencie eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Eventos</CardTitle>
                  <CardDescription>Atividades programadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {event.date.toLocaleDateString()}
                        </span>
                      </motion.div>
                    ))}
                    <Button 
                      className="w-full bg-primary hover:bg-primary-dark transition-colors"
                      onClick={() => handleAddEvent({ date: new Date(), title: "Novo Evento", type: "meeting" })}
                    >
                      Adicionar Evento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
                  />
                </div>
                <Button
                  onClick={handleFetchStudents}
                  className="w-full bg-primary hover:bg-primary-dark transition-colors"
                >
                  Buscar Alunos
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center text-muted-foreground">
                  <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {paginatedStudents?.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <span className="text-lg font-semibold">{student.name}</span>
                        <div className="text-sm text-muted-foreground">{student.city}</div>
                      </div>
                      <div className="ml-4">
                        <Button 
                          onClick={() => handleEditModalOpen(student)}
                          variant="outline"
                          className="mr-2"
                        >
                          Editar
                        </Button>
                        <Button 
                          onClick={() => handleDeleteStudent(student.id)} 
                          variant="destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between mt-4">
                    <Button 
                      onClick={() => setCurrentPage(currentPage - 1)} 
                      disabled={currentPage <= 1}
                    >
                      Página Anterior
                    </Button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <Button 
                      onClick={() => setCurrentPage(currentPage + 1)} 
                      disabled={currentPage >= totalPages}
                    >
                      Próxima Página
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <DataExport />  {/* Componente para exportar dados */}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <AdminManagement />  {/* Componente para gerenciar administradores */}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={handleEditModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="studentName">Nome</Label>
            <Input
              id="studentName"
              value={selectedStudent?.name || ""}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => handleEditStudent(selectedStudent?.id!, selectedStudent!)}
              className="w-full bg-primary"
            >
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
