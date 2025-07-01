
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoDisplay } from "@/components/layout/LogoDisplay";

const Login = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary p-4">
      <div className="w-full max-w-md space-y-4">
        {showAdminSetup ? (
          <Card className="w-full animate-fadeIn">
            <CardHeader className="text-center space-y-2">
              <LogoDisplay className="mx-auto" />
              <CardTitle className="text-2xl font-bold text-primary-dark">
                Configuração Administrativa
              </CardTitle>
              <CardDescription>
                Use as credenciais abaixo para acessar como administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-3 text-blue-800">Credenciais do Administrador:</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Email:</strong> admin@localibc.com</p>
                  <p><strong>Senha:</strong> 110011H810</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowAdminSetup(false)}
                className="w-full"
                variant="outline"
              >
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <LoginForm />
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setShowAdminSetup(true)}
                className="text-white/80 hover:text-white text-sm"
              >
                Credenciais do Administrador
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
