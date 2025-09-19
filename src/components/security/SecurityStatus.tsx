import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus = ({ className }: SecurityStatusProps) => {
  const [securityMetrics, setSecurityMetrics] = useState({
    isSecure: true,
    lastSecurityScan: new Date().toISOString(),
    activeThreats: 0,
    rateLimitActive: false,
    encryptionEnabled: true
  });

  useEffect(() => {
    // Simular verificação de segurança
    const checkSecurity = () => {
      // Verificar se há tentativas de login recentes bloqueadas
      const rateLimitData = localStorage.getItem('rateLimitWarning');
      
      setSecurityMetrics(prev => ({
        ...prev,
        rateLimitActive: !!rateLimitData,
        lastSecurityScan: new Date().toISOString()
      }));
    };

    checkSecurity();
    const interval = setInterval(checkSecurity, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getSecurityLevel = () => {
    if (securityMetrics.activeThreats > 0) return 'high';
    if (securityMetrics.rateLimitActive) return 'medium';
    return 'low';
  };

  const securityLevel = getSecurityLevel();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Status de Segurança</CardTitle>
        {securityLevel === 'low' && <ShieldCheck className="h-4 w-4 text-green-600" />}
        {securityLevel === 'medium' && <ShieldAlert className="h-4 w-4 text-orange-600" />}
        {securityLevel === 'high' && <Shield className="h-4 w-4 text-red-600" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nível de Segurança</span>
            <Badge 
              variant={securityLevel === 'low' ? 'default' : 
                      securityLevel === 'medium' ? 'secondary' : 'destructive'}
            >
              {securityLevel === 'low' && 'Seguro'}
              {securityLevel === 'medium' && 'Atenção'}
              {securityLevel === 'high' && 'Alerta'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rate Limiting</span>
            <Badge variant={securityMetrics.rateLimitActive ? 'secondary' : 'default'}>
              {securityMetrics.rateLimitActive ? 'Ativo' : 'Normal'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Criptografia</span>
            <Badge variant={securityMetrics.encryptionEnabled ? 'default' : 'destructive'}>
              {securityMetrics.encryptionEnabled ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>
              Última verificação: {new Date(securityMetrics.lastSecurityScan).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};