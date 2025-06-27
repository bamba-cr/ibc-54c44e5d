
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';

export const LocalAdminSetup = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAndSetupAdmin();
  }, []);

  const checkAndSetupAdmin = async () => {
    try {
      // Verificar se o admin local já existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'localibc@system.local')
        .single();

      if (existingProfile) {
        // Verificar se tem role de admin
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingProfile.id)
          .eq('role', 'admin')
          .single();

        if (adminRole) {
          setIsConfigured(true);
          setIsLoading(false);
          return;
        }
      }

      // Se chegou aqui, precisa configurar o admin
      await setupAdmin();
    } catch (error) {
      console.error('Error checking admin:', error);
      await setupAdmin();
    }
  };

  const setupAdmin = async () => {
    try {
      // Primeiro, tentar criar o usuário no auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@localibc.com',
        password: '110011H810',
        options: {
          data: {
            username: 'localibc',
            full_name: 'Administrador Local',
          }
        }
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        throw signUpError;
      }

      // Aguardar um pouco para o usuário ser processado
      setTimeout(async () => {
        try {
          // Buscar o perfil criado
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'admin@localibc.com')
            .single();

          if (profile) {
            // Criar role de admin
            await supabase
              .from('user_roles')
              .insert({
                user_id: profile.id,
                role: 'admin'
              });

            // Aprovar automaticamente
            await supabase
              .from('profiles')
              .update({
                status: 'approved',
                approved_at: new Date().toISOString()
              })
              .eq('id', profile.id);

            setIsConfigured(true);
            toast({
              title: "Administrador configurado",
              description: "Administrador local configurado automaticamente!",
            });
          }
        } catch (error) {
          console.error('Error setting up admin role:', error);
          toast({
            title: "Aviso",
            description: "Administrador pode precisar ser configurado manualmente.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setIsLoading(false);
      toast({
        title: "Informação",
        description: "Use as credenciais abaixo para fazer login.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <CardTitle>Verificando Sistema</CardTitle>
          <CardDescription>
            Configurando administrador local...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto border-green-200 bg-green-50">
      <CardHeader className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <CardTitle className="text-green-800">Sistema Configurado</CardTitle>
        <CardDescription className="text-green-700">
          O administrador local está pronto para uso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-medium mb-3 text-green-800">Credenciais de Acesso:</h4>
            <div className="space-y-2 text-sm text-green-800">
              <p><strong>Email:</strong> admin@localibc.com</p>
              <p><strong>Usuário:</strong> localibc</p>
              <p><strong>Senha:</strong> 110011H810</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              Use essas credenciais para fazer login como administrador
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
