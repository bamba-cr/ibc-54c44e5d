import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

  const handleAddEvent = (newEvent: typeof events[0]) => {
    setEvents([...events, newEvent]);
    toast({
      title: "Evento adicionado",
      description: `"${newEvent.title}" foi adicionado ao calendário.`
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
        title: "Erro",
        description: validationError
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
        title: "Sucesso",
        description: "Aluno atualizado com sucesso."
      });
      fetchStudents();
      handleEditModalClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar aluno."
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const { error: attendanceError } = await supabase
        .from("attendance")
        .delete()
        .eq("student_id", studentId);

      if (attendanceError) throw attendanceError;

      const { error: gradesError } = await supabase
        .from("grades")
        .delete()
        .eq("student_id", studentId);

      if (gradesError) throw gradesError;

      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno excluído com sucesso."
      });
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir aluno. Verifique se não existem registros vinculados."
      });
    }
  };

  const exportData = students?.map((student) => ({
    Nome: student.name,
    Idade: student.age,
    Cidade: student.city,
    "Data de Nascimento": student.birth_date,
    "Nome do Responsável": student.guardian_name,
    "Telefone do Responsável": student.guardian_phone
  }));

  const handleBackup = async () => {
    try {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;

      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "backup-alunos.json";
      link.click();

      toast({
        title: "Sucesso",
        description: "Backup gerado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar backup."
      });
    }
  };

  const handleExportPDF = async () => {
    toast({
      title: "Em breve",
      description: "Exportação para PDF em desenvolvimento."
    });
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios e Gestão</h1>
      
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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

            <Card>
              <CardHeader>
                <CardTitle>Eventos</CardTitle>
                <CardDescription>Atividades programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{event.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  <Button className="w-full" onClick={() => handleAddEvent({ date: new Date(), title: "Novo Evento", type: "meeting" })}>
                    Adicionar Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <div className="flex gap-2">
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
                  <Button variant="outline" onClick={() => setFilters({ name: "", age: "", city: "", birth_date: "" })}>
                    Limpar Filtros
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {isLoading && <p>Buscando alunos...</p>}
                  {paginatedStudents?.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <span>{student.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditModalOpen(student)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Anterior
                  </Button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios do Sistema</CardTitle>
              <CardDescription>Gere relatórios diversos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">
                  <CSVLink data={exportData} filename="alunos.csv">
                    Exportar Alunos (CSV)
                  </CSVLink>
                </Button>
                <Button className="w-full" onClick={handleExportPDF}>
                  Exportar Alunos (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Button className="w-full" onClick={handleBackup}>
            Gerar Backup
          </Button>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditModalOpen} onOpenChange={handleEditModalClose}>
        <DialogContent>
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
                  photo_url: formData.get("photo_url") as string,
                  projeto_capoeira: formData.get("projeto_capoeira") === "on",
                  projeto_futebol: formData.get("projeto_futebol") === "on",
                  projeto_judo: formData.get("projeto_judo") === "on",
                  projeto_musica: formData.get("projeto_musica") === "on",
                  projeto_informatica: formData.get("projeto_informatica") === "on",
                  projeto_zumba: formData.get("projeto_zumba") === "on",
                  projeto_reforco_escolar: formData.get("projeto_reforco_escolar") === "on",
                };
                handleEditStudent(selectedStudent.id, updatedData);
              }}
            >
              <div className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input name="name" defaultValue={selectedStudent.name} placeholder="Nome" />
                </div>
                <div>
                  <Label>Idade</Label>
                  <Input name="age" defaultValue={selectedStudent.age} placeholder="Idade" type="number" />
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input name="birth_date" defaultValue={selectedStudent.birth_date} placeholder="Data de Nascimento" type="date" />
                </div>
                <div>
                  <Label>RG</Label>
                  <Input name="rg" defaultValue={selectedStudent.rg} placeholder="RG" />
                </div>
                <div>
                  <Label>CPF</Label>
                  <Input name="cpf" defaultValue={selectedStudent.cpf} placeholder="CPF" />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input name="address" defaultValue={selectedStudent.address} placeholder="Endereço" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input name="city" defaultValue={selectedStudent.city} placeholder="Cidade" />
                </div>
                <div>
                  <Label>Nome do Responsável</Label>
                  <Input name="guardian_name" defaultValue={selectedStudent.guardian_name} placeholder="Nome do Responsável" />
                </div>
                <div>
                  <Label>Grau de Parentesco</Label>
                  <Input name="guardian_relationship" defaultValue={selectedStudent.guardian_relationship} placeholder="Grau de Parentesco" />
                </div>
                <div>
                  <Label>CPF do Responsável</Label>
                  <Input name="guardian_cpf" defaultValue={selectedStudent.guardian_cpf} placeholder="CPF do Responsável" />
                </div>
                <div>
                  <Label>RG do Responsável</Label>
                  <Input name="guardian_rg" defaultValue={selectedStudent.guardian_rg} placeholder="RG do Responsável" />
                </div>
                <div>
                  <Label>Telefone do Responsável</Label>
                  <Input name="guardian_phone" defaultValue={selectedStudent.guardian_phone} placeholder="Telefone do Responsável" />
                </div>
                <div>
                  <Label>Email do Responsável</Label>
                  <Input name="guardian_email" defaultValue={selectedStudent.guardian_email} placeholder="Email do Responsável" />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Input name="notes" defaultValue={selectedStudent.notes} placeholder="Observações" />
                </div>
                <div>
                  <Label>URL
