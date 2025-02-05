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
                
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center p-4"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {paginatedStudents?.map((student) => (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {student.age} anos • {student.city}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditModalOpen(student)}
                              className="flex-1 md:flex-none"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                              disabled={isDeleting}
                              className="flex-1 md:flex-none text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>

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
          <DataExport />
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <AdminManagement />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={handleEditModalClose}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedData = {
                  name: formData.get("name") as string,
                  age: parseInt(formData.get("age") as string),
                  birth_date: formData.get("birth_date") as string,
                  rg: formData.get("rg") as string,
                  cpf: formData.get("cpf") as string,
                  address: formData.get("address") as string,
                  city: formData.get("city") as string,
                  guardian_name: formData.get("guardian_name") as string,
                  guardian_relationship: formData.get("guardian_relationship") as string,
                  guardian_cpf: formData.get("guardian_cpf") as string,
                  guardian_rg: formData.get("guardian_rg") as string,
                  guardian_phone: formData.get("guardian_phone") as string,
                  guardian_email: formData.get("guardian_email") as string,
                  notes: formData.get("notes") as string,
                };
                handleEditStudent(selectedStudent.id, updatedData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input 
                    name="name" 
                    defaultValue={selectedStudent.name} 
                    placeholder="Nome" 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input 
                    name="age" 
                    defaultValue={selectedStudent.age} 
                    placeholder="Idade" 
                    type="number" 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input 
                    name="birth_date" 
                    defaultValue={selectedStudent.birth_date} 
                    type="date" 
                    required 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input 
                    name="rg" 
                    defaultValue={selectedStudent.rg} 
                    placeholder="RG" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input 
                    name="cpf" 
                    defaultValue={selectedStudent.cpf} 
                    placeholder="CPF" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input 
                    name="address" 
                    defaultValue={selectedStudent.address} 
                    placeholder="Endereço" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input 
                    name="city" 
                    defaultValue={selectedStudent.city} 
                    placeholder="Cidade" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Responsável</Label>
                  <Input 
                    name="guardian_name" 
                    defaultValue={selectedStudent.guardian_name} 
                    placeholder="Nome do Responsável" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grau de Parentesco</Label>
                  <Input 
                    name="guardian_relationship" 
                    defaultValue={selectedStudent.guardian_relationship} 
                    placeholder="Grau de Parentesco" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF do Responsável</Label>
                  <Input 
                    name="guardian_cpf" 
                    defaultValue={selectedStudent.guardian_cpf} 
                    placeholder="CPF do Responsável" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG do Responsável</Label>
                  <Input 
                    name="guardian_rg" 
                    defaultValue={selectedStudent.guardian_rg} 
                    placeholder="RG do Responsável" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone do Responsável</Label>
                  <Input 
                    name="guardian_phone" 
                    defaultValue={selectedStudent.guardian_phone} 
                    placeholder="Telefone do Responsável" 
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email do Responsável</Label>
                  <Input 
                    name="guardian_email" 
                    defaultValue={selectedStudent.guardian_email} 
                    placeholder="Email do Responsável" 
                    type="email" 
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Input 
                    name="notes" 
                    defaultValue={selectedStudent.notes} 
                    placeholder="Observações" 
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleEditModalClose}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark"
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Relatorios;
