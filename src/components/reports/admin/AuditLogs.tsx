import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Shield, User, Calendar, FileText } from "lucide-react";
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

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

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
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Auditoria - Administradores
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum log de auditoria encontrado</p>
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
                {logs.map((log) => (
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
