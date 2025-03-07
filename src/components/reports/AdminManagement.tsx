
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus } from "lucide-react";

// Define interface for Admin User type to solve the TypeScript error
interface AdminUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
  };
  // Add other properties if needed
}

export const AdminManagement = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateUsername = (username: string) => {
    return username.length >= 3;
  };

  const handleAddAdmin = async () => {
    if (!validateUsername(username)) {
      toast({
        title: "Nome de usuário inválido",
        description: "O nome de usuário deve ter pelo menos 3 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First get current user's session to get their ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("Usuário não autenticado");
      }
      
      const currentUserId = sessionData.session.user.id;

      // Check if current user has admin role
      const { data: currentUserRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .eq('role', 'admin')
        .single();

      if (roleCheckError || !currentUserRole) {
        throw new Error("Você não tem permissão para adicionar administradores");
      }

      // Get user ID from auth API - with proper typing
      const { data, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError || !data) {
        throw new Error("Erro ao buscar usuários");
      }
      
      // Cast the users array to the defined AdminUser type
      const users = data.users as AdminUser[];
      
      // Find user by username in metadata
      const targetUser = users.find(user => 
        user.user_metadata?.username?.toLowerCase() === username.toLowerCase()
      );
      
      if (!targetUser) {
        throw new Error("Usuário não encontrado. O usuário precisa criar uma conta primeiro.");
      }

      const targetUserId = targetUser.id;

      // Check if user is already an admin
      const { data: existingRole, error: existingRoleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("role", "admin");

      if (existingRole && existingRole.length > 0) {
        toast({
          title: "Usuário já é admin",
          description: "Este usuário já possui privilégios de administrador.",
          variant: "destructive",
        });
        return;
      }

      // Add admin role
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
        description: "Usuário promovido a administrador com sucesso.",
      });

      setUsername("");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Administradores
        </CardTitle>
        <CardDescription>Adicione novos administradores ao sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleAddAdmin}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isLoading ? "Adicionando..." : "Adicionar Admin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
