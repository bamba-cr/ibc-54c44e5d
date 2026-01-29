import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegisterUserFormProps {
  onUserAdded?: () => void;
}

export const RegisterUserForm = ({ onUserAdded }: RegisterUserFormProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (password.length < 8) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'create',
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
          username: username.trim() || undefined,
          role,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Usuário cadastrado!",
        description: `${data.user.email} foi cadastrado com sucesso como ${getRoleLabel(role)}.`,
      });

      // Limpar formulário
      setEmail("");
      setFullName("");
      setUsername("");
      setPassword("");
      setRole("user");
      setShowPassword(false);

      onUserAdded?.();
    } catch (error) {
      console.error("Error registering user:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao cadastrar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'coordenador':
        return 'Coordenador';
      case 'instrutor':
        return 'Instrutor';
      default:
        return 'Usuário';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">Email *</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="usuario@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-username">Nome de Usuário</Label>
          <Input
            id="register-username"
            type="text"
            placeholder="nome.usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-fullname">Nome Completo</Label>
          <Input
            id="register-fullname"
            type="text"
            placeholder="Nome Completo do Usuário"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-role">Função *</Label>
          <Select value={role} onValueChange={setRole} disabled={isLoading}>
            <SelectTrigger id="register-role">
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuário</SelectItem>
              <SelectItem value="instrutor">Instrutor</SelectItem>
              <SelectItem value="coordenador">Coordenador</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Instrutor: registra frequência/notas | Coordenador: gerencia alunos/projetos
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="register-password">Senha *</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="pr-10"
              required
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
            Mínimo de 8 caracteres
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cadastrando...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Usuário
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
