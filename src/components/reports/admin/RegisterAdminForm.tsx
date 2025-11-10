import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RegisterAdminFormProps {
  onAdminAdded: () => void;
}

export const RegisterAdminForm = ({ onAdminAdded }: RegisterAdminFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres";
    }
    if (!/[A-Z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula";
    }
    if (!/[a-z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula";
    }
    if (!/[0-9]/.test(password)) {
      return "A senha deve conter pelo menos um número";
    }
    return null;
  };

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Email e senha são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Senha inválida",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Chamar edge function para cadastrar admin
      const { data, error } = await supabase.functions.invoke('register-admin', {
        body: {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          username: username.trim() || email.split('@')[0],
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Administrador cadastrado!",
        description: `${data.user.email} foi cadastrado como administrador com sucesso.`,
      });

      // Limpar formulário
      setEmail("");
      setPassword("");
      setFullName("");
      setUsername("");
      onAdminAdded();
    } catch (error) {
      console.error("Error registering admin:", error);
      toast({
        title: "Erro ao cadastrar administrador",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastrar Novo Administrador
        </CardTitle>
        <CardDescription>
          Preencha os dados abaixo para cadastrar um novo administrador no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegisterAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nome Completo do Administrador"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, com letras maiúsculas, minúsculas e números
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Administrador
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
