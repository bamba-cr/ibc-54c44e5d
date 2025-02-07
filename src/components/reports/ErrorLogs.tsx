
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ErrorLog {
  id: string;
  user_email: string | null;
  error_type: string;
  message: string;
  stack_trace: string | null;
  route: string | null;
  created_at: string;
  resolved: boolean;
}

export const ErrorLogs = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.rpc('get_error_logs_with_details');
      
      if (error) throw error;
      
      setLogs(data || []);
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

  const getErrorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      api: "bg-yellow-500",
      frontend: "bg-red-500",
      backend: "bg-purple-500",
      database: "bg-blue-500",
      auth: "bg-orange-500",
      other: "bg-gray-500"
    };
    return colors[type] || colors.other;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Logs de Erro
        </CardTitle>
        <CardDescription>Monitoramento de erros do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4">Nenhum log de erro encontrado.</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={`${getErrorTypeColor(log.error_type)} text-white`}>
                    {log.error_type.toUpperCase()}
                  </Badge>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
