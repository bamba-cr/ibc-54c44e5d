
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus } from "lucide-react";
import { User } from "@supabase/supabase-js";

export const AdminManagement = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAddAdmin = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First get current user's session to get their ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Check if current user has admin role
      const { data: currentUserRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (roleCheckError || !currentUserRole) {
        throw new Error("Você não tem permissão para adicionar administradores");
      }

      // Get target user's ID from their email by checking auth.users
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        throw new Error("Erro ao buscar usuários");
      }

      const targetUser = users.find((u: User) => u.email === email);

      if (!targetUser) {
        throw new Error("Usuário não encontrado. O usuário precisa criar uma conta primeiro.");
      }

      const targetUserId = targetUser.id;

      // Check if user is already an admin
      const { data: existingRole, error: existingRoleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("role", "admin")
        .single();

      if (existingRole) {
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

      setEmail("");
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
            type="email"
            placeholder="Email do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
