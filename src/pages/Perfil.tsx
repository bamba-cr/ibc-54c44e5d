import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { 
  User, 
  Mail, 
  Key, 
  Shield, 
  Save, 
  Loader2, 
  Phone, 
  Briefcase,
  Users,
  Settings
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

const Perfil = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    username: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user && profile) {
      setFormData({
        email: user.email || "",
        full_name: profile.full_name || "",
        username: profile.username || "",
        phone: profile.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Validar senha se estiver tentando alterar
      if (formData.newPassword) {
        if (formData.newPassword.length < 8) {
          toast.error('A nova senha deve ter no mínimo 8 caracteres');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }
        if (!formData.currentPassword) {
          toast.error('Digite sua senha atual para alterá-la');
          return;
        }
      }

      // Atualizar email se mudou
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
        toast.info('Um email de confirmação foi enviado para o novo endereço');
      }

      // Atualizar senha se fornecida
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (passwordError) throw passwordError;
      }

      // Atualizar metadados do usuário
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          username: formData.username,
        },
      });
      if (metadataError) throw metadataError;

      // Atualizar tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
      
      // Limpar campos de senha
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (formData.full_name) {
      return formData.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return formData.username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getRoleBadge = () => {
    if (profile?.is_admin) {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <Shield className="h-3 w-3 mr-1" />
          Administrador
        </Badge>
      );
    }
    
    const roleLabels: Record<string, { label: string; color: string }> = {
      coordenador: { label: "Coordenador", color: "bg-blue-500" },
      instrutor: { label: "Instrutor", color: "bg-green-500" },
      user: { label: "Usuário", color: "bg-gray-500" },
    };
    
    const roleInfo = roleLabels[profile?.role || "user"];
    
    return (
      <Badge className={`${roleInfo.color} text-white border-0`}>
        <Briefcase className="h-3 w-3 mr-1" />
        {roleInfo.label}
      </Badge>
    );
  };

  const handlePhotoUpdated = (url: string) => {
    refreshProfile();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Background decorations */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <Navbar />
        
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meu Perfil</h1>
            </div>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Segurança
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              {/* Photo and Role Card */}
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <ProfilePhotoUpload
                      currentPhotoUrl={profile?.avatar_url || null}
                      userId={user?.id || ""}
                      fallbackInitials={getInitials()}
                      onPhotoUpdated={handlePhotoUpdated}
                    />
                    
                    <Separator orientation="vertical" className="hidden md:block h-24" />
                    <Separator className="md:hidden w-full" />
                    
                    <div className="flex-1 text-center md:text-left space-y-3">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {formData.full_name || formData.username}
                        </h2>
                        <p className="text-muted-foreground">{formData.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {getRoleBadge()}
                        {profile?.status === "approved" && (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            Conta Ativa
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info Card */}
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Seus dados básicos de identificação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Seu nome de usuário"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info Card */}
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contato
                  </CardTitle>
                  <CardDescription>
                    Informações de contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Endereço de Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-card/60 backdrop-blur-sm border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>
                    Atualize sua senha de acesso ao sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Digite a nova senha novamente"
                      />
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Requisitos da senha:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Mínimo de 8 caracteres</li>
                      <li>• Recomendado: letras, números e caracteres especiais</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading || !formData.newPassword}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Atualizar Senha
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Bottom spacing for mobile nav */}
          <div className="h-20 md:hidden" />
        </main>
      </div>
    </AuthGuard>
  );
};

export default Perfil;
