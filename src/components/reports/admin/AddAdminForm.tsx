
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddAdminFormProps {
  onAdminAdded: () => void;
}

export const AddAdminForm = ({ onAdminAdded }: AddAdminFormProps) => {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateInput = (input: string) => {
    if (input.length < 3) {
      return "O identificador deve ter pelo menos 3 caracteres.";
    }
    // Verificar se é email válido ou username válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input) && input.length < 3) {
      return "Digite um email válido ou nome de usuário.";
    }
    return null;
  };

  const handleAddAdmin = async () => {
    const validationError = validateInput(identifier);
    if (validationError) {
      toast({
        title: "Entrada inválida",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se o usuário atual é admin
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("Usuário não autenticado");
      }
      
      const currentUserId = sessionData.session.user.id;

      // Verificar se o usuário atual tem role admin
      const { data: currentUserRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .eq('role', 'admin')
        .single();

      if (roleCheckError || !currentUserRole) {
        throw new Error("Você não tem permissão para adicionar administradores");
      }

      // Buscar usuário usando a nova função
      const { data: targetUser, error: searchError } = await supabase
        .rpc('find_user_by_identifier', { identifier });
      
      if (searchError || !targetUser || targetUser.length === 0) {
        throw new Error("Usuário não encontrado. Verifique se o email ou nome de usuário está correto.");
      }

      const targetUserId = targetUser[0].user_id;

      // Verificar se o usuário já é admin
      const { data: existingRole, error: existingRoleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("role", "admin");

      if (existingRoleError) {
        throw existingRoleError;
      }

      if (existingRole && existingRole.length > 0) {
        toast({
          title: "Usuário já é admin",
          description: "Este usuário já possui privilégios de administrador.",
          variant: "destructive",
        });
        return;
      }

      // Adicionar role admin
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: targetUserId,
        role: "admin",
      });

      if (roleError) {
        console.error("Error adding admin role:", roleError);
        throw roleError;
      }

      toast({
        title: "Sucesso!",
        description: `${targetUser[0].username || targetUser[0].email} foi promovido a administrador.`,
      });

      setIdentifier("");
      onAdminAdded();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "Erro ao adicionar admin",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAddAdmin();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Adicionar Administrador
        </CardTitle>
        <CardDescription>
          Digite o email ou nome de usuário do usuário que deseja promover a administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Email ou nome de usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleAddAdmin}
            disabled={isLoading || !identifier.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Adicionando..." : "Adicionar Admin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
