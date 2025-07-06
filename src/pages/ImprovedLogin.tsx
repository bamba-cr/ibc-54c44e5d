
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImprovedUserRegistrationForm } from "@/components/auth/ImprovedUserRegistrationForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { Shield, GraduationCap, Users, BarChart3 } from "lucide-react";

const ImprovedLogin = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (!isLoading && user && user.status === 'approved') {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Carregando...</h2>
          <p className="text-gray-600">Aguarde um momento</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-8">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6"
              >
                <GraduationCap className="h-10 w-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Sistema de Gestão Acadêmica
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Plataforma completa para gerenciamento educacional com recursos avançados 
                de acompanhamento de alunos, relatórios e administração.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
              >
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-800">Gestão de Alunos</h3>
                <p className="text-sm text-gray-600">Cadastro completo e acompanhamento</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
              >
                <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-800">Relatórios</h3>
                <p className="text-sm text-gray-600">Análises detalhadas e exportações</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
              >
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-gray-800">Segurança</h3>
                <p className="text-sm text-gray-600">Controle de acesso avançado</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50"
              >
                <GraduationCap className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-semibold text-gray-800">Educação</h3>
                <p className="text-sm text-gray-600">Foco no desenvolvimento acadêmico</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-300"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300"
              >
                Cadastro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm />
              </motion.div>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ImprovedUserRegistrationForm 
                  onSuccess={() => {
                    setTimeout(() => setActiveTab("login"), 2000);
                  }}
                />
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              © 2024 Sistema de Gestão Acadêmica. Todos os direitos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImprovedLogin;
