import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Users, Key, Mail, Search, FileText } from "lucide-react";
import { DatabaseBackup } from "@/components/reports/DatabaseBackup";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Relatorios = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch students for the search functionality
  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .ilike("name", `%${searchTerm}%`);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length > 2,
  });
  
  const events = [
    { date: new Date(), title: "Reunião Pedagógica", type: "meeting" },
    { date: new Date(new Date().setDate(new Date().getDate() + 1)), title: "Entrega de Notas", type: "deadline" },
  ];

  const handleEditStudent = (studentId: string) => {
    navigate(`/editar-aluno?id=${studentId}`);
  };

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
                  <Button className="w-full">
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
                    placeholder="Buscar aluno por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {isLoading && <p>Buscando alunos...</p>}
                  {students?.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <span>{student.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStudent(student.id)}
                      >
                        Editar
                      </Button>
                    </div>
                  ))}
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
                <Button className="w-full" onClick={() => toast({ title: "Em breve", description: "Função em desenvolvimento" })}>
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Frequência
                </Button>
                <Button className="w-full" onClick={() => toast({ title: "Em breve", description: "Função em desenvolvimento" })}>
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Notas
                </Button>
                <Button className="w-full" onClick={() => toast({ title: "Em breve", description: "Função em desenvolvimento" })}>
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório de Projetos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <DatabaseBackup />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;