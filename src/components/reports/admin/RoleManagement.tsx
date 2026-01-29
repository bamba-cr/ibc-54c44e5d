
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Users, UserCog, GraduationCap, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  username: string;
  status: string;
  current_role: string;
  created_at: string;
}

const ROLES = [
  { value: 'admin', label: 'Administrador', icon: Shield, description: 'Acesso total ao sistema' },
  { value: 'coordenador', label: 'Coordenador', icon: UserCog, description: 'Gerenciar alunos e projetos' },
  { value: 'instrutor', label: 'Instrutor', icon: GraduationCap, description: 'Registrar frequência e notas' },
  { value: 'user', label: 'Usuário', icon: Users, description: 'Acesso básico de visualização' },
];

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

  // Buscar todos os usuários aprovados com suas roles
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Buscar perfis aprovados
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, email, full_name, username, status, created_at")
        .eq("status", "approved")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          current_role: userRole?.role || 'user',
        };
      });

      return usersWithRoles;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'coordenador' | 'instrutor' | 'user' }) => {
      const { data, error } = await supabase.rpc("assign_user_role", {
        target_user_id: userId,
        new_role: role,
      });

      if (error) throw error;
      if (!data) throw new Error("Falha ao atribuir função");

      return data;
    },
    onSuccess: (_, { userId }) => {
      toast({
        title: "Sucesso!",
        description: "Função do usuário atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      // Remover a mudança pendente
      setPendingChanges((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atribuir a função",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const confirmRoleChange = (userId: string) => {
    const newRole = pendingChanges[userId] as 'admin' | 'coordenador' | 'instrutor' | 'user';
    if (newRole) {
      assignRoleMutation.mutate({ userId, role: newRole });
    }
  };

  const cancelRoleChange = (userId: string) => {
    setPendingChanges((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'coordenador':
        return 'default';
      case 'instrutor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const found = ROLES.find((r) => r.value === role);
    return found?.label || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          Gerenciamento de Funções
        </CardTitle>
        <CardDescription>
          Atribua funções aos usuários aprovados. Cada função define as permissões de acesso no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Legenda de funções */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {ROLES.map((role) => (
            <div key={role.value} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <role.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{role.label}</p>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função Atual</TableHead>
              <TableHead>Nova Função</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{user.full_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Desde {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.current_role)}>
                    {getRoleLabel(user.current_role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={pendingChanges[user.user_id] || user.current_role}
                    onValueChange={(value) => handleRoleChange(user.user_id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <role.icon className="h-4 w-4" />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {pendingChanges[user.user_id] && pendingChanges[user.user_id] !== user.current_role && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                        onClick={() => confirmRoleChange(user.user_id)}
                        disabled={assignRoleMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                        onClick={() => cancelRoleChange(user.user_id)}
                        disabled={assignRoleMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!users || users.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum usuário aprovado encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
