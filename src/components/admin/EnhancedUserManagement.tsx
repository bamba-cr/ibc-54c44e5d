import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Search, 
  Trash2, 
  Edit,
  AlertTriangle,
  Users,
  Filter,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatabaseUserProfile {
  id: string;
  user_id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_admin: boolean | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  rejection_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface EditUserData {
  username: string;
  full_name: string;
  phone: string;
  is_admin: boolean;
}

export const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<DatabaseUserProfile | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editUserData, setEditUserData] = useState<EditUserData>({
    username: '',
    full_name: '',
    phone: '',
    is_admin: false,
  });

  const { toast } = useToast();
  const { approveUser, rejectUser, promoteToAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Query para todos os usuários
  const { data: allUsers, isLoading, refetch } = useQuery({
    queryKey: ['all-users-enhanced'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id:id,
          email,
          username,
          full_name,
          avatar_url,
          phone,
          is_admin,
          status,
          rejection_reason,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(user => ({
        ...user,
        user_id: user.user_id || user.id,
        status: user.status || 'pending' as const,
        is_admin: user.is_admin || false,
      })) as DatabaseUserProfile[];
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Filtrar usuários
  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Estatísticas
  const stats = {
    total: allUsers?.length || 0,
    pending: allUsers?.filter(u => u.status === 'pending').length || 0,
    approved: allUsers?.filter(u => u.status === 'approved').length || 0,
    rejected: allUsers?.filter(u => u.status === 'rejected').length || 0,
    admins: allUsers?.filter(u => u.is_admin).length || 0,
  };

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await approveUser(userId);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      toast({
        title: "✓ Usuário aprovado",
        description: "O usuário foi aprovado com sucesso!",
        className: "border-green-200 bg-green-50",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-enhanced'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const result = await rejectUser(userId, reason);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado com sucesso!",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-enhanced'] });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await promoteToAdmin(userId);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      toast({
        title: "✓ Usuário promovido",
        description: "O usuário foi promovido a administrador com sucesso!",
        className: "border-blue-200 bg-blue-50",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-enhanced'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao promover usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<EditUserData> }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✓ Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso!",
        className: "border-blue-200 bg-blue-50",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-enhanced'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso!",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['all-users-enhanced'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: DatabaseUserProfile) => {
    setSelectedUser(user);
    setEditUserData({
      username: user.username || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      is_admin: user.is_admin || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleReject = (user: DatabaseUserProfile) => {
    setSelectedUser(user);
    setIsRejectDialogOpen(true);
  };

  const handleDelete = (user: DatabaseUserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <UserCheck className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <UserX className="h-3 w-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Admins</p>
                <p className="text-2xl font-bold text-purple-800">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabela Principal */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <CardDescription>
            Gerencie usuários do sistema, aprove cadastros e defina permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar por nome, email ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => refetch()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">@{user.username || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.email || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline">Usuário</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {user.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => approveMutation.mutate(user.user_id)}
                                  disabled={approveMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 h-8 px-2"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(user)}
                                  disabled={rejectMutation.isPending}
                                  className="h-8 px-2"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            
                            {user.status === 'approved' && !user.is_admin && (
                              <Button
                                size="sm"
                                onClick={() => promoteMutation.mutate(user.user_id)}
                                disabled={promoteMutation.isPending}
                                className="bg-purple-600 hover:bg-purple-700 h-8 px-2"
                              >
                                <Shield className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                              className="h-8 px-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(user)}
                              disabled={deleteMutation.isPending}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nenhum usuário encontrado com os filtros aplicados' 
                    : 'Nenhum usuário cadastrado'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-fullname">Nome Completo</Label>
              <Input
                id="edit-fullname"
                value={editUserData.full_name}
                onChange={(e) => setEditUserData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Nome de Usuário</Label>
              <Input
                id="edit-username"
                value={editUserData.username}
                onChange={(e) => setEditUserData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editUserData.phone}
                onChange={(e) => setEditUserData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  editMutation.mutate({
                    userId: selectedUser.id,
                    data: editUserData
                  });
                }
              }}
              disabled={editMutation.isPending}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Rejeitar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja rejeitar o usuário <strong>{selectedUser?.full_name}</strong>?</p>
            <Label htmlFor="reason">Motivo da rejeição (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Digite o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  rejectMutation.mutate({
                    userId: selectedUser.user_id,
                    reason: rejectionReason
                  });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remover Usuário
            </DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja remover permanentemente o usuário <strong>{selectedUser?.full_name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) {
                  deleteMutation.mutate(selectedUser.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
