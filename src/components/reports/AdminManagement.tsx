
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define interface for User with Role
interface UserWithRole {
  id: string;
  email: string;
  username: string;
  role_id: string;
}

export const AdminManagement = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [admins, setAdmins] = useState<UserWithRole[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, userId: string, username: string}>({
    open: false,
    userId: "",
    username: ""
  });
  const { toast } = useToast();

  // Fetch current admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      // Get all users with admin role
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*, profiles(email, username)")
        .eq("role", "admin");
      
      if (rolesError) {
        throw rolesError;
      }

      if (!adminRoles || !adminRoles.length) {
        setAdmins([]);
        setIsLoadingAdmins(false);
        return;
      }

      // Map admin users with their details from the profiles table
      const adminsList = adminRoles
        .map(role => {
          // Check if profiles data exists and has the expected structure
          const profile = role.profiles as { email?: string; username?: string } | null;
          
          return {
            id: role.user_id,
            email: profile?.email || "Email não disponível",
            username: profile?.username || "Usuário sem nome",
            role_id: role.id
          };
        })
        .filter(Boolean) as UserWithRole[];

      setAdmins(adminsList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Erro ao buscar administradores",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os administradores.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdmins(false);
    }
  };

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

      // Find user by username in profiles table
      const { data: targetProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();
      
      if (profileError || !targetProfile) {
        throw new Error("Usuário não encontrado. O usuário precisa criar uma conta primeiro.");
      }

      const targetUserId = targetProfile.id;

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
      // Refresh admin list
      fetchAdmins();
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

  const handleRemoveAdmin = async (userId: string) => {
    setIsLoading(true);
    try {
      // Find the role_id for this user
      const adminToRemove = admins.find(admin => admin.id === userId);
      
      if (!adminToRemove) {
        throw new Error("Administrador não encontrado");
      }

      // Check if current user is the same as the one being removed
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user.id === userId) {
        throw new Error("Você não pode remover seus próprios privilégios de administrador");
      }
      
      // Delete the role
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminToRemove.role_id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Administrador removido",
        description: "O usuário foi removido da lista de administradores com sucesso.",
      });

      // Refresh the admin list
      fetchAdmins();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro ao remover administrador",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao remover o administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, userId: "", username: "" });
    }
  };

  const openConfirmDialog = (userId: string, username: string) => {
    setConfirmDialog({
      open: true,
      userId,
      username
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Administradores
        </CardTitle>
        <CardDescription>Adicione ou remova administradores do sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Administradores atuais</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAdmins} 
              disabled={isLoadingAdmins}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
          
          {admins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-20 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConfirmDialog(admin.id, admin.username)}
                        className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isLoadingAdmins ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Carregando administradores...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum administrador encontrado ou você não tem permissão para visualizá-los.</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({...confirmDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Você está prestes a remover os privilégios de administrador de <strong>{confirmDialog.username}</strong>. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({...confirmDialog, open: false})}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleRemoveAdmin(confirmDialog.userId)}
              disabled={isLoading}
            >
              {isLoading ? "Removendo..." : "Remover administrador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
