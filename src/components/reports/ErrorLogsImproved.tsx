
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, RefreshCw, Filter, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Json } from "@/integrations/supabase/types";

interface ErrorLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  error_type: string;
  message: string;
  stack_trace: string | null;
  route: string | null;
  created_at: string;
  resolved: boolean;
  resolution_notes: string | null;
  additional_data?: Json | null;
}

export const ErrorLogsImproved = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Usar a função RPC melhorada
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_error_logs_with_details');
      
      if (rpcError) {
        console.error('Error fetching logs with RPC:', rpcError);
        throw rpcError;
      }
      
      if (rpcData) {
        const typedLogs: ErrorLog[] = rpcData.map(log => ({
          id: log.id,
          user_id: log.user_id,
          user_email: log.user_email,
          error_type: log.error_type,
          message: log.message,
          stack_trace: log.stack_trace,
          route: log.route,
          created_at: log.created_at,
          resolved: log.resolved,
          resolution_notes: log.resolution_notes,
          additional_data: log.additional_data
        }));
        
        setLogs(typedLogs);
        setFilteredLogs(typedLogs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de erro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = logs;
    
    // Filtrar por status
    if (filter === 'resolved') {
      filtered = filtered.filter(log => log.resolved);
    } else if (filter === 'unresolved') {
      filtered = filtered.filter(log => !log.resolved);
    }
    
    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.error_type === typeFilter);
    }
    
    setFilteredLogs(filtered);
  }, [logs, filter, typeFilter]);

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', id);
        
      if (error) throw error;
      
      setLogs(prev => prev.map(log => 
        log.id === id ? { ...log, resolved: true } : log
      ));
      
      toast({
        title: "Log resolvido",
        description: "O log foi marcado como resolvido."
      });
    } catch (error) {
      console.error('Error updating log:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o log como resolvido.",
        variant: "destructive"
      });
    }
  };

  const getErrorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      api: "bg-[#00fe9b] text-[#00041f]",
      frontend: "bg-[#6765e0] text-[#f7f7ff]",
      backend: "bg-[#00041f] text-[#f7f7ff]",
      database: "bg-blue-500 text-white",
      auth: "bg-orange-500 text-white",
      other: "bg-gray-500 text-white"
    };
    return colors[type.toLowerCase()] || colors.other;
  };

  const getUniqueErrorTypes = () => {
    const types = [...new Set(logs.map(log => log.error_type))];
    return types.sort();
  };

  const exportLogs = () => {
    const csvContent = [
      ['ID', 'Tipo', 'Mensagem', 'Usuário', 'Rota', 'Data', 'Resolvido'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.error_type,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_email || 'N/A',
        log.route || 'N/A',
        new Date(log.created_at).toLocaleString(),
        log.resolved ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Logs de Erro
          <Badge variant="destructive" className="ml-2">
            {filteredLogs.filter(log => !log.resolved).length} não resolvidos
          </Badge>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
            <span>Monitoramento de erros do sistema</span>
            <div className="flex gap-2 flex-wrap">
              <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unresolved">Não resolvidos</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {getUniqueErrorTypes().map(type => (
                    <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchLogs} 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {logs.length === 0 ? "Nenhum log de erro encontrado." : "Nenhum log corresponde aos filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className={`border rounded-lg p-4 space-y-3 ${log.resolved ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getErrorTypeColor(log.error_type)}>
                      {log.error_type.toUpperCase()}
                    </Badge>
                    {log.resolved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" /> Resolvido
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{log.message}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {log.user_email && (
                      <p><span className="font-medium">Usuário:</span> {log.user_email}</p>
                    )}
                    {log.route && (
                      <p><span className="font-medium">Rota:</span> {log.route}</p>
                    )}
                  </div>
                </div>
                
                {log.stack_trace && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto border">
                      {log.stack_trace}
                    </pre>
                  </details>
                )}
                
                {!log.resolved && (
                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsResolved(log.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como resolvido
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
