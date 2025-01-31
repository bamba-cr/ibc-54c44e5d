import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Users, Key, Mail } from "lucide-react";
import { useState } from "react";

const Relatorios = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const events = [
    { date: new Date(), title: "Reunião Pedagógica", type: "meeting" },
    { date: new Date(new Date().setDate(new Date().getDate() + 1)), title: "Entrega de Notas", type: "deadline" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Relatórios e Gestão</h1>
      
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="password">Senhas</TabsTrigger>
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

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Administradores</CardTitle>
                <CardDescription>Controle de acesso ao sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <Users className="h-4 w-4" />
                    <span>Administradores Ativos</span>
                    <span className="ml-auto">3</span>
                  </div>
                  <Button className="w-full">
                    Gerenciar Administradores
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Controle de Permissões</CardTitle>
                <CardDescription>Níveis de acesso e autorizações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-2 border rounded-lg">
                    <Key className="h-4 w-4" />
                    <span>Grupos de Permissão</span>
                    <span className="ml-auto">4</span>
                  </div>
                  <Button className="w-full">
                    Configurar Permissões
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Recuperação de Senha</CardTitle>
              <CardDescription>Gerenciamento de redefinição de senhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 border rounded-lg">
                  <Mail className="h-4 w-4" />
                  <span>Solicitações Pendentes</span>
                  <span className="ml-auto">0</span>
                </div>
                <Button className="w-full">
                  Configurar Sistema de Recuperação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;