
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Check, X, Clock, UserPlus, Shield, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { PendingUser } from '@/types/auth';

export const UserManagementImproved = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [promoteUserId, setPromoteUserId] = useState('');
  const [isPromotingAdmin, setIsPromotingAdmin] = useState(false);
  const { getPendingUsers, approveUser, rejectUser, promoteToAdmin } = useAuth();
  const { toast } = useToast();

  const loadPendingUsers = async () => {
    try {
      setIsLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários pendentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  useEffect(() => {
    const filtered = pendingUsers.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, pendingUsers]);

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
        title: "✓ Usuário aprovado",
        description: "O usuário foi aprovado com sucesso.",
        className: "border-green-200 bg-green-50",
      });
      loadPendingUsers();
    }
  };

  const handleReject = async (userId: string) => {
    const { error } = await rejectUser(userId, rejectionReason);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o usuário.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Usuário rejeitado",
        description: "O usuário foi rejeitado.",
        variant: "destructive",
      });
      setRejectionReason('');
      setSelectedUser(null);
      loadPendingUsers();
    }
  };

  const handlePromoteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPromotingAdmin(true);

    const { error } = await promoteToAdmin(promoteUserId);
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário a administrador.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "✓ Administrador criado",
        description: "O usuário foi promovido a administrador com sucesso.",
        className: "border-blue-200 bg-blue-50",
      });
      setPromoteUserId('');
    }
    
    setIsPromotingAdmin(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Gerenciamento de Usuários
        </h1>
        <p className="text-lg text-gray-600">
          Gerencie aprovações e promova administradores com facilidade
        </p>
      </motion.div>

      {/* Promover Administrador */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Shield className="h-6 w-6 mr-3 text-blue-600" />
              Promover Administrador
            </CardTitle>
            <CardDescription className="text-blue-700">
              Promova um usuário aprovado a administrador do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePromoteAdmin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="promote-user" className="text-sm font-medium text-blue-900">
                  ID do usuário
                </Label>
                <Input
                  id="promote-user"
                  type="text"
                  placeholder="ID do usuário a ser promovido"
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                  disabled={isPromotingAdmin}
                  className="border-blue-200 focus:border-blue-400 transition-colors"
                />
                <p className="text-xs text-blue-600">
                  O usuário deve já estar aprovado no sistema
                </p>
              </div>
              <Button
                type="submit"
                disabled={isPromotingAdmin || !promoteUserId.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                {isPromotingAdmin ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Promovendo...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Promover a Admin
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Usuários Pendentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-orange-900">
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-3 text-orange-600" />
                Usuários Pendentes
                <Badge variant="secondary" className="ml-3 bg-orange-200 text-orange-800">
                  {filteredUsers.length}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPendingUsers}
                disabled={isLoading}
                className="border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardTitle>
            <CardDescription className="text-orange-700">
              Gerencie aprovações de novos usuários no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length > 0 && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-orange-200 focus:border-orange-400"
                  />
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-400" />
                <p className="text-orange-600 text-lg">Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-orange-300" />
                <p className="text-orange-600 text-lg font-medium">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário pendente'}
                </p>
                <p className="text-orange-500 text-sm mt-2">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Todos os usuários foram processados'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-white rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {user.full_name || user.username}
                        </h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-1 font-mono text-sm">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.user_id)}
                        className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedUser(user.user_id)}
                            className="bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-red-900">Rejeitar Usuário</DialogTitle>
                            <DialogDescription className="text-gray-600">
                              Você está prestes a rejeitar o acesso de{' '}
                              <strong>{user.full_name || user.username}</strong>.
                              Opcionalmente, você pode fornecer um motivo.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Motivo da rejeição (opcional)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setSelectedUser(null)}>
                              Cancelar
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(user.user_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Confirmar Rejeição
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
