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

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: {
    user_id: string;
    email: string;
    username: string;
  } | null;
  onSuccess: () => void;
}

export const EditAdminDialog = ({ open, onOpenChange, admin, onSuccess }: EditAdminDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (admin && open) {
      setEmail(admin.email || "");
      setUsername(admin.username || "");
      setFullName("");
      setPassword("");
      setShowPassword(false);
    }
  }, [admin, open]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!admin) return;

    // Validar email se foi modificado
    if (email && email !== admin.email && !validateEmail(email)) {
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
      // Preparar dados para atualização (apenas campos que foram alterados)
      const updateData: any = {
        user_id: admin.user_id,
      };

      if (email && email !== admin.email) {
        updateData.email = email.trim();
      }

      if (username && username !== admin.username) {
        updateData.username = username.trim();
      }

      if (fullName && fullName.trim()) {
        updateData.full_name = fullName.trim();
      }

      if (password) {
        updateData.password = password;
      }

      // Verificar se há algo para atualizar
      if (Object.keys(updateData).length === 1) {
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum campo foi modificado.",
          variant: "destructive",
        });
        return;
      }

      // Chamar edge function para atualizar
      const { data, error } = await supabase.functions.invoke('update-admin', {
        body: updateData,
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Administrador atualizado!",
        description: "Os dados foram atualizados com sucesso.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Administrador</DialogTitle>
          <DialogDescription>
            Atualize os dados do administrador. Deixe os campos em branco para manter os valores atuais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder={admin?.email || "admin@exemplo.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Email atual: {admin?.email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Nome de usuário</Label>
              <Input
                id="edit-username"
                type="text"
                placeholder={admin?.username || "usuario"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Usuário atual: {admin?.username}
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
                Deixe em branco para manter o nome atual
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
                Deixe em branco para manter a senha atual
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
