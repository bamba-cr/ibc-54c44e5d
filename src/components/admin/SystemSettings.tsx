
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

interface SystemConfig {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireApproval: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export const SystemSettings = () => {
  const [config, setConfig] = useState<SystemConfig>({
    siteName: 'Sistema de Gestão Acadêmica',
    siteDescription: 'Gerencie alunos, frequência, notas e relatórios de forma eficiente',
    allowRegistration: true,
    requireApproval: true,
    maintenanceMode: false,
    maintenanceMessage: 'Sistema em manutenção. Tente novamente em alguns minutos.',
  });
  const { toast } = useToast();

  useEffect(() => {
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem('system-config');
    if (savedConfig) {
      setConfig({ ...config, ...JSON.parse(savedConfig) });
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('system-config', JSON.stringify(config));
    toast({
      title: "Configurações salvas",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configurações do Sistema</span>
        </CardTitle>
        <CardDescription>
          Configure as opções gerais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nome do Site</Label>
            <Input
              id="site-name"
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Descrição do Site</Label>
            <Textarea
              id="site-description"
              value={config.siteDescription}
              onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permitir Registro</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que novos usuários se registrem no sistema
              </p>
            </div>
            <Switch
              checked={config.allowRegistration}
              onCheckedChange={(checked) => setConfig({ ...config, allowRegistration: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Requer Aprovação</Label>
              <p className="text-sm text-muted-foreground">
                Novos usuários precisam ser aprovados por um administrador
              </p>
            </div>
            <Switch
              checked={config.requireApproval}
              onCheckedChange={(checked) => setConfig({ ...config, requireApproval: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                Ativar modo de manutenção para o sistema
              </p>
            </div>
            <Switch
              checked={config.maintenanceMode}
              onCheckedChange={(checked) => setConfig({ ...config, maintenanceMode: checked })}
            />
          </div>
        </div>

        {config.maintenanceMode && (
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Mensagem de Manutenção</Label>
            <Textarea
              id="maintenance-message"
              value={config.maintenanceMessage}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              rows={3}
            />
          </div>
        )}

        <Button onClick={saveSettings} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  );
};
