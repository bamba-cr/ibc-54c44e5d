import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, RefreshCw, AlertCircle, Edit, Trash2, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditUserDialog } from "./EditUserDialog";
import { RegisterUserForm } from "./RegisterUserForm";
import { ConfirmDialog } from "./ConfirmDialog";

interface UserData {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  is_admin: boolean;
  created_at: string;
  role?: string;
}

export const AllUsersList = () => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Buscar todos os perfis aprovados (não-pendentes)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Buscar roles de cada usuário
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id || profile.id)
            .maybeSingle();
          
          return {
            ...profile,
            role: roleData?.role || 'user',
          };
        })
      );

      // Filtrar para mostrar apenas não-admins
      return usersWithRoles.filter(u => !u.is_admin && u.role !== 'admin') as UserData[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          user_id: userId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'coordenador':
        return <Badge className="bg-blue-500">Coordenador</Badge>;
      case 'instrutor':
        return <Badge className="bg-green-500">Instrutor</Badge>;
      default:
        return <Badge variant="secondary">Usuário</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de cadastro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar Novo Usuário
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRegisterForm(!showRegisterForm)}
            >
              {showRegisterForm ? 'Fechar' : 'Abrir Formulário'}
            </Button>
          </CardTitle>
          <CardDescription>
            Cadastre novos usuários com funções de Instrutor, Coordenador ou Usuário comum
          </CardDescription>
        </CardHeader>
        {showRegisterForm && (
          <CardContent>
            <RegisterUserForm onUserAdded={() => {
              refetch();
              setShowRegisterForm(false);
            }} />
          </CardContent>
        )}
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Sistema
              <Badge variant="secondary" className="ml-2">
                {users?.length || 0}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários aprovados do sistema (exceto administradores)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome de Usuário</TableHead>
                  <TableHead>Nome Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username || '-'}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Carregando usuários...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja remover o usuário "${selectedUser?.username || selectedUser?.email}"? Esta ação não pode ser desfeita.`}
        onConfirm={() => {
          if (selectedUser?.user_id) {
            deleteMutation.mutate(selectedUser.user_id);
          }
        }}
        isLoading={deleteMutation.isPending}
        confirmText="Remover"
        variant="destructive"
      />
    </div>
  );
};
