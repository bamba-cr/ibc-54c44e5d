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
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

const Relatorios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    age: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: students, isLoading, refetch: fetchStudents } = useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      let query = supabase.from("students").select("*");

      if (filters.name) query = query.ilike("name", `%${filters.name}%`);
      if (filters.age) query = query.eq("age", parseInt(filters.age));

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

  const handleAddEvent = (newEvent: typeof events[0]) => {
    setEvents([...events, newEvent]);
    toast({
      title: "Evento adicionado",
      description: `"${newEvent.title}" foi adicionado ao calendário.`
    });
  };

  const handleEditStudent = async (studentId: string, updatedData: Partial<Student>) => {
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
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar aluno."
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // First delete related records in attendance
      const { error: attendanceError } = await supabase
        .from("attendance")
        .delete()
        .eq("student_id", studentId);

      if (attendanceError) throw attendanceError;

      // Then delete related records in grades
      const { error: gradesError } = await supabase
        .from("grades")
        .delete()
        .eq("student_id", studentId);

      if (gradesError) throw gradesError;

      // Finally delete the student
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
    Idade: student.age
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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/login");
    };
    checkSession();
  }, [navigate]);

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
                    placeholder="Email"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  />
                  <Input
                    placeholder="Idade"
                    value={filters.age}
                    onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                  />
                  <Button variant="outline" onClick={() => setFilters({ name: "", email: "", age: "" })}>
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
                          onClick={() => handleEditStudent(student.id, { name: "Novo Nome" })}
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
                  <span>Página {currentPage}</span>
                  <Button
                    disabled={currentPage * itemsPerPage >= students?.length}
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
    </div>
  );
};

export default Relatorios;