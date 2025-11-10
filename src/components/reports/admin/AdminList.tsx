
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Trash2, RefreshCw, AlertCircle, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "./ConfirmDialog";
import { EditAdminDialog } from "./EditAdminDialog";

interface AdminUser {
  user_id: string;
  email: string;
  username: string;
  role_id: string;
  created_at: string;
}

interface AdminListProps {
  refreshTrigger: number;
}

export const AdminList = ({ refreshTrigger }: AdminListProps) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    username: string;
    roleId: string;
  }>({
    open: false,
    userId: "",
    username: "",
    roleId: ""
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    admin: AdminUser | null;
  }>({
    open: false,
    admin: null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [refreshTrigger]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      // Usar a nova função melhorada
      const { data: adminUsers, error } = await supabase
        .rpc('get_admin_users');
      
      if (error) {
        console.error("Error fetching admin users:", error);
        throw error;
      }

      if (adminUsers) {
        setAdmins(adminUsers);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Erro ao buscar administradores",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os administradores.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, roleId: string) => {
    try {
      // Verificar se o usuário não está removendo a si mesmo
      if (currentUserId === userId) {
        throw new Error("Você não pode remover seus próprios privilégios de administrador");
      }
      
      // Deletar o role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Administrador removido",
        description: "O usuário foi removido da lista de administradores com sucesso.",
      });

      fetchAdmins();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro ao remover administrador",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o administrador.",
        variant: "destructive",
      });
    } finally {
      setConfirmDialog({ open: false, userId: "", username: "", roleId: "" });
    }
  };

  const openConfirmDialog = (userId: string, username: string, roleId: string) => {
    setConfirmDialog({
      open: true,
      userId,
      username,
      roleId
    });
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  const openEditDialog = (admin: AdminUser) => {
    setEditDialog({
      open: true,
      admin
    });
  };

  const handleEditSuccess = () => {
    fetchAdmins();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administradores Atuais
            <Badge variant="secondary" className="ml-2">
              {admins.length}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAdmins} 
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Lista de todos os usuários com privilégios de administrador
        </CardDescription>
      </CardHeader>
      <CardContent>
        {admins.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead className="w-32 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.role_id} className={isCurrentUser(admin.user_id) ? "bg-blue-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {admin.username}
                      {isCurrentUser(admin.user_id) && (
                        <Badge variant="secondary" className="text-xs">Você</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {!isCurrentUser(admin.user_id) ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(admin)}
                            className="h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            title="Editar administrador"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openConfirmDialog(admin.user_id, admin.username, admin.role_id)}
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Remover privilégios de administrador"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando administradores...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum administrador encontrado.</p>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({...confirmDialog, open})}
        title="Confirmar remoção"
        description={`Você está prestes a remover os privilégios de administrador de ${confirmDialog.username}. Essa ação não pode ser desfeita.`}
        onConfirm={() => handleRemoveAdmin(confirmDialog.userId, confirmDialog.roleId)}
      />

      <EditAdminDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({...editDialog, open})}
        admin={editDialog.admin}
        onSuccess={handleEditSuccess}
      />
    </Card>
  );
};
