
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoDisplay } from "@/components/layout/LogoDisplay";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";

const Login = () => {
  const [showAdminSetup, setShowAdminSetup] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {showAdminSetup ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <LogoDisplay className="mx-auto mb-4" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                    <Shield className="h-6 w-6 mr-2 text-blue-600" />
                    Configuração Administrativa
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Use as credenciais abaixo para acessar como administrador
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200"
                >
                  <h3 className="font-semibold mb-4 text-blue-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Credenciais do Administrador:
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-blue-800 font-mono">admin@localibc.com</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium text-gray-700">Senha:</span>
                      <span className="text-blue-800 font-mono">110011H810</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button 
                    onClick={() => setShowAdminSetup(false)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Login
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <LoginForm />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Button
                variant="link"
                onClick={() => setShowAdminSetup(true)}
                className="text-white/90 hover:text-white text-sm bg-black/10 hover:bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-200"
              >
                <Shield className="h-4 w-4 mr-2" />
                Credenciais do Administrador
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
