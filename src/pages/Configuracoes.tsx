
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Bell, Shield, Database, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Configuracoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  const handleSaveConfig = () => {
    setLoading(true);
    
    // Simulação de salvamento
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso."
      });
    }, 1000);
  };
  
  const handleDatabaseBackup = async () => {
    setLoading(true);
    try {
      // Aqui seria implementada a lógica de backup
      toast({
        title: "Backup iniciado",
        description: "O backup do banco de dados foi iniciado. Você será notificado quando for concluído."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar o backup.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
        </div>
        
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">Sistema</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Preferências Gerais</CardTitle>
                <CardDescription>
                  Configure as opções gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Modo escuro</Label>
                      <div className="text-sm text-muted-foreground">
                        Ative o modo escuro para reduzir o cansaço visual
                      </div>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Modo compacto</Label>
                      <div className="text-sm text-muted-foreground">
                        Reduza o espaçamento e tamanho dos elementos
                      </div>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveConfig} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar preferências"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input id="name" defaultValue="Usuário IBC" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" defaultValue="usuario@ibc.org.br" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bio" className="text-right">
                      Bio
                    </Label>
                    <Textarea id="bio" placeholder="Sobre você..." className="col-span-3" />
                  </div>
                </div>
                <Button onClick={handleSaveConfig} disabled={loading}>
                  {loading ? "Salvando..." : "Atualizar perfil"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Gerencie como e quando você recebe notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificações por email</Label>
                      <div className="text-sm text-muted-foreground">
                        Receba atualizações importantes por email
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="app-notifications">Notificações no sistema</Label>
                      <div className="text-sm text-muted-foreground">
                        Veja atualizações em tempo real no sistema
                      </div>
                    </div>
                    <Switch
                      id="app-notifications"
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveConfig} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar preferências"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>
                  Gerencie suas credenciais e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <Button variant="outline">Alterar senha</Button>
                  <Button variant="outline">Ativar autenticação em dois fatores</Button>
                  <Button variant="outline">Gerenciar dispositivos conectados</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Sistema</CardTitle>
                <CardDescription>
                  Configurações avançadas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="logs">Registros de log</Label>
                      <div className="text-sm text-muted-foreground">
                        Mantenha logs detalhados para diagnóstico
                      </div>
                    </div>
                    <Switch
                      id="logs"
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button onClick={handleDatabaseBackup} disabled={loading} variant="outline" className="w-full">
                    <Database className="mr-2 h-4 w-4" />
                    {loading ? "Processando..." : "Fazer backup do banco de dados"}
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver logs do sistema
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Configuracoes;
