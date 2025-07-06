
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { LogIn, UserPlus, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema de Gestão
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma moderna e segura para gerenciamento de usuários e recursos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Segurança Avançada</CardTitle>
                <CardDescription>
                  Sistema de autenticação robusto com controle de acesso baseado em permissões
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <UserPlus className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Gestão de Usuários</CardTitle>
                <CardDescription>
                  Controle completo sobre cadastros, aprovações e permissões de usuários
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <LogIn className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Interface Moderna</CardTitle>
                <CardDescription>
                  Design responsivo e intuitivo para uma experiência de usuário excepcional
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Acesse o Sistema</CardTitle>
              <CardDescription>
                Faça login ou crie sua conta para começar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Entrar no Sistema
              </Button>
              
              <div className="text-sm text-gray-600">
                <p>Credenciais do administrador:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">
                  Email: admin@sistema.com<br />
                  Senha: admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
