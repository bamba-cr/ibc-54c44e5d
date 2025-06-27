
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2 } from 'lucide-react';

export const InitialAdminSetup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setupInitialAdmin } = useAuth();
  const { toast } = useToast();

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await setupInitialAdmin(email);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Não foi possível configurar o administrador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Administrador configurado",
          description: "O usuário foi promovido a administrador com sucesso.",
        });
        setEmail('');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <CardTitle>Configurar Primeiro Administrador</CardTitle>
        <CardDescription>
          Configure o primeiro administrador do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSetupAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email do Administrador</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-600">
              Este usuário deve já estar cadastrado no sistema
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Configurar Admin
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
