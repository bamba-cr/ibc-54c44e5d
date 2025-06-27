
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle } from 'lucide-react';

export const LocalAdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { setupInitialAdmin } = useAuth();
  const { toast } = useToast();

  const setupLocalAdmin = async () => {
    setIsLoading(true);
    
    try {
      // Primeiro, tentar criar o usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'localibc@system.local',
        password: '110011H810',
        options: {
          data: {
            username: 'localibc',
            full_name: 'Administrador Local',
          }
        }
      });

      if (signUpError && signUpError.message !== 'User already registered') {
        throw signUpError;
      }

      // Aguardar um pouco para o usuário ser criado no banco
      setTimeout(async () => {
        try {
          // Configurar como administrador
          const { error: adminError } = await setupInitialAdmin('localibc@system.local');
          
          if (adminError) {
            toast({
              title: "Erro",
              description: "Não foi possível configurar o administrador local.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Administrador configurado",
              description: "Administrador local configurado com sucesso!",
            });
            setIsComplete(true);
          }
        } catch (error) {
          console.error('Error setting up admin:', error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao configurar o administrador.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="max-w-md mx-auto border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <CardTitle className="text-green-800">Administrador Configurado</CardTitle>
          <CardDescription className="text-green-700">
            O administrador local foi configurado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>Email:</strong> localibc@system.local</p>
            <p><strong>Usuário:</strong> localibc</p>
            <p><strong>Senha:</strong> 110011H810</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <CardTitle>Configurar Administrador Local</CardTitle>
        <CardDescription>
          Configure o administrador local do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Credenciais do Administrador:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> localibc@system.local</p>
              <p><strong>Usuário:</strong> localibc</p>
              <p><strong>Senha:</strong> 110011H810</p>
            </div>
          </div>
          
          <Button
            onClick={setupLocalAdmin}
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
                Configurar Admin Local
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
