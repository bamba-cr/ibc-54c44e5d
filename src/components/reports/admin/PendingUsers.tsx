
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserX, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PendingUsers = () => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading, refetch } = useQuery({
    queryKey: ["pending-users"],
    queryFn: async () => {
      console.log('Fetching pending users...');
      const { data, error } = await supabase.rpc('get_pending_users');
      
      if (error) {
        console.error('Error fetching pending users:', error);
        throw error;
      }
      
      console.log('Pending users data:', data);
      return data as PendingUser[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Approving user:', userId);
      const { data, error } = await supabase.rpc('approve_user', { 
        target_user_id: userId 
      });
      
      if (error) {
        console.error('Error approving user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
    },
    onError: (error) => {
      console.error('Approve mutation error:', error);
      toast({
        title: "Erro ao aprovar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao aprovar o usuário.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('Rejecting user:', userId, 'with reason:', reason);
      const { data, error } = await supabase.rpc('reject_user', { 
        target_user_id: userId,
        reason: reason || null
      });
      
      if (error) {
        console.error('Error rejecting user:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Reject mutation error:', error);
      toast({
        title: "Erro ao rejeitar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao rejeitar o usuário.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (user: PendingUser) => {
    setSelectedUser(user);
    setIsRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedUser) {
      rejectMutation.mutate({
        userId: selectedUser.user_id,
        reason: rejectionReason,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usuários Pendentes de Aprovação
            <Badge variant="secondary" className="ml-2">
              {pendingUsers?.length || 0}
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
          Usuários que aguardam aprovação para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsers && pendingUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome de Usuário</TableHead>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.user_id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(user)}
                        disabled={rejectMutation.isPending}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Rejeitar
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
            <span className="ml-2">Carregando usuários pendentes...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nenhum usuário pendente de aprovação.</p>
          </div>
        )}

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Usuário</DialogTitle>
              <DialogDescription>
                Você está prestes a rejeitar o usuário <strong>{selectedUser?.username}</strong>. 
                Opcionalmente, forneça um motivo para a rejeição.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Motivo da rejeição (opcional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
