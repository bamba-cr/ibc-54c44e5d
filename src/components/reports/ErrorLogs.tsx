
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export const ErrorLogs = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Tentar usar a função RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_error_logs_with_details');
      
      if (!rpcError && rpcData) {
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
        return;
      }

      // Se a função RPC falhar, usar query direta
      const { data: directData, error: directError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (directError) {
        console.error('Error fetching logs directly:', directError);
        throw directError;
      }
      
      if (directData) {
        const typedLogs: ErrorLog[] = directData.map(log => ({
          id: log.id,
          user_id: log.user_id,
          user_email: null, // Sem email quando usando query direta
          error_type: log.error_type,
          message: log.message,
          stack_trace: log.stack_trace,
          route: log.route,
          created_at: log.created_at,
          resolved: log.resolved || false,
          resolution_notes: log.resolution_notes,
          additional_data: log.additional_data
        }));
        
        setLogs(typedLogs);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Logs de Erro
        </CardTitle>
        <CardDescription>
          <div className="flex justify-between items-center">
            <span>Monitoramento de erros do sistema</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchLogs} 
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4">Nenhum log de erro encontrado.</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className={`border rounded-lg p-4 space-y-2 ${log.resolved ? 'bg-gray-50' : ''}`}>
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
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{log.message}</h4>
                  {log.user_email && (
                    <p className="text-sm text-gray-600">Usuário: {log.user_email}</p>
                  )}
                  {log.route && (
                    <p className="text-sm text-gray-600">Rota: {log.route}</p>
                  )}
                </div>
                {log.stack_trace && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600">Stack Trace</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {log.stack_trace}
                    </pre>
                  </details>
                )}
                {!log.resolved && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsResolved(log.id)}
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
