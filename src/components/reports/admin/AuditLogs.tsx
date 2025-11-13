import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Shield, User, Calendar, FileText, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  id: string;
  user_id: string;
  target_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: any;
  new_values: any;
  changed_fields: string[];
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user_email?: string;
  target_user_email?: string;
}

interface FilterState {
  startDate: string;
  endDate: string;
  action: string;
  userEmail: string;
  targetUserEmail: string;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: "",
    endDate: "",
    action: "all",
    userEmail: "",
    targetUserEmail: "",
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Usar supabase diretamente sem tipagem para tabela nova
      const response = await fetch(
        `https://jyugggqkpgjwvuufhdwc.supabase.co/rest/v1/audit_logs?entity_type=eq.admin&order=created_at.desc&limit=100`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dWdnZ3FrcGdqd3Z1dWZoZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NTgsImV4cCI6MjA1Mzg5OTQ1OH0.-9Klhq-JKJebV8XvgduY3WguR00vJ5-YPZMuIlbAT5Y',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();

      // Buscar emails dos usuários separadamente
      const userIds = [...new Set([
        ...data.map((log: any) => log.user_id),
        ...data.map((log: any) => log.target_user_id)
      ].filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const emailMap = new Map(profiles?.map((p: any) => [p.user_id, p.email]) || []);

        const formattedLogs = data.map((log: any) => ({
          ...log,
          user_email: emailMap.get(log.user_id),
          target_user_email: emailMap.get(log.target_user_id),
        }));

        setLogs(formattedLogs);
      } else {
        setLogs(data);
      }
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtrar por data inicial
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(log => new Date(log.created_at) >= startDate);
    }

    // Filtrar por data final
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo o dia final
      filtered = filtered.filter(log => new Date(log.created_at) <= endDate);
    }

    // Filtrar por tipo de ação
    if (filters.action && filters.action !== "all") {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Filtrar por email do usuário que fez a ação
    if (filters.userEmail) {
      const searchTerm = filters.userEmail.toLowerCase();
      filtered = filtered.filter(log => 
        log.user_email?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por email do admin afetado
    if (filters.targetUserEmail) {
      const searchTerm = filters.targetUserEmail.toLowerCase();
      filtered = filtered.filter(log => 
        log.target_user_email?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      action: "all",
      userEmail: "",
      targetUserEmail: "",
    });
  };

  const hasActiveFilters = () => {
    return filters.startDate !== "" || 
           filters.endDate !== "" || 
           filters.action !== "all" || 
           filters.userEmail !== "" || 
           filters.targetUserEmail !== "";
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      CREATE: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
    };
    return <Badge variant={variants[action] || 'default'}>{action}</Badge>;
  };

  const formatChanges = (log: AuditLog) => {
    if (!log.changed_fields || log.changed_fields.length === 0) {
      return 'Nenhuma alteração';
    }

    return (
      <div className="space-y-1 text-sm">
        {log.changed_fields.map((field) => (
          <div key={field} className="flex flex-col">
            <span className="font-medium text-foreground">{field}:</span>
            {log.old_values?.[field] !== undefined && (
              <span className="text-muted-foreground">
                De: {String(log.old_values[field])}
              </span>
            )}
            {log.new_values?.[field] !== undefined && (
              <span className="text-foreground">
                Para: {String(log.new_values[field])}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Auditoria - Administradores
          </CardTitle>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Ocultar" : "Mostrar"} Filtros
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-1">
                {filteredLogs.length}
              </Badge>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Tipo de Ação</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => setFilters({ ...filters, action: value })}
                >
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="CREATE">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Exclusão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Usuário (quem fez)</Label>
                <Input
                  id="userEmail"
                  type="text"
                  placeholder="Buscar por email..."
                  value={filters.userEmail}
                  onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUserEmail">Admin Afetado</Label>
                <Input
                  id="targetUserEmail"
                  type="text"
                  placeholder="Buscar por email..."
                  value={filters.targetUserEmail}
                  onChange={(e) => setFilters({ ...filters, targetUserEmail: e.target.value })}
                />
              </div>
            </div>

            {hasActiveFilters() && (
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredLogs.length} de {logs.length} registros
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tabela de logs */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {hasActiveFilters() 
                ? "Nenhum log encontrado com os filtros aplicados" 
                : "Nenhum log de auditoria encontrado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Admin Afetado</TableHead>
                  <TableHead>Alterações</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user_email || 'Sistema'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.target_user_email || 'N/A'}</span>
                    </TableCell>
                    <TableCell>{formatChanges(log)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {log.ip_address || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
