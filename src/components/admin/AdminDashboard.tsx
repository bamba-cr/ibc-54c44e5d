
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  RefreshCw,
  LogOut,
  Clock
} from "lucide-react";
import { PendingUser } from "@/types/auth";
import { motion } from "framer-motion";

export const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut, getPendingUsers, approveUser, rejectUser, promoteToAdmin } = useAuth();
  const { toast } = useToast();

  const fetchPendingUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar usuários pendentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    const { error } = await approveUser(userId);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Usuário aprovado!",
        description: "O usuário foi aprovado com sucesso.",
      });
      fetchPendingUsers();
    }
  };

  const handleReject = async (userId: string) => {
    const reason = prompt("Motivo da rejeição (opcional):");
    const { error } = await rejectUser(userId, reason || undefined);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o usuário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado com sucesso.",
      });
      fetchPendingUsers();
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (confirm("Tem certeza que deseja promover este usuário a administrador?")) {
      const { error } = await promoteToAdmin(userId);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível promover o usuário.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Usuário promovido!",
          description: "O usuário foi promovido a administrador.",
        });
        fetchPendingUsers();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <Badge className="bg-blue-100 text-blue-800">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {user?.full_name}
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  aguardando aprovação
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  no sistema
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">
                  funcionando normalmente
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pending Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Usuários Pendentes</CardTitle>
                  <CardDescription>
                    Usuários aguardando aprovação para acessar o sistema
                  </CardDescription>
                </div>
                <Button onClick={fetchPendingUsers} disabled={isLoading} size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário pendente no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Solicitado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApprove(user.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleReject(user.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
