import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    email: string;
    username: string;
    full_name?: string;
    role?: string;
  } | null;
  onSuccess: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && open) {
      setEmail(user.email || "");
      setUsername(user.username || "");
      setFullName(user.full_name || "");
      setRole(user.role || "user");
      setPassword("");
      setShowPassword(false);
    }
  }, [user, open]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validar email se foi modificado
    if (email && email !== user.email && !validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar senha se foi fornecida
    if (password && password.length < 8) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Preparar dados para atualização
      const updateData: Record<string, string> = {
        action: 'update',
        user_id: user.user_id,
      };

      if (email && email !== user.email) {
        updateData.email = email.trim();
      }

      if (username && username !== user.username) {
        updateData.username = username.trim();
      }

      if (fullName && fullName !== user.full_name) {
        updateData.full_name = fullName.trim();
      }

      if (role && role !== user.role) {
        updateData.role = role;
      }

      if (password) {
        updateData.password = password;
      }

      // Verificar se há algo para atualizar
      if (Object.keys(updateData).length === 2) { // apenas action e user_id
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum campo foi modificado.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: updateData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Usuário atualizado!",
        description: "Os dados foram atualizados com sucesso.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o usuário.",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados do usuário. Deixe os campos em branco para manter os valores atuais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder={user?.email || "usuario@exemplo.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Email atual: {user?.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Nome de usuário</Label>
              <Input
                id="edit-username"
                type="text"
                placeholder={user?.username || "usuario"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Usuário atual: {user?.username || '-'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Nome completo</Label>
              <Input
                id="edit-fullName"
                type="text"
                placeholder="Nome Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Nome atual: {user?.full_name || 'Não definido'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="instrutor">Instrutor</SelectItem>
                  <SelectItem value="coordenador">Coordenador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Função atual: {getRoleLabel(user?.role || 'user')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Nova senha (opcional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
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
                Deixe em branco para manter a senha atual (mínimo 8 caracteres)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
