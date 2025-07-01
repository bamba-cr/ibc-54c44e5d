
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoDisplay } from "@/components/layout/LogoDisplay";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", username: "" });
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = { email: "", password: "", username: "" };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    if (isSignUp && !username.trim()) {
      newErrors.username = "Nome de usuário é obrigatório";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isSignUp) {
      const { error } = await signUp(email, password, {
        username,
        full_name: fullName,
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro ao criar a conta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Sua conta foi criada e está aguardando aprovação do administrador.",
        });
        setIsSignUp(false);
        // Limpar formulário
        setEmail("");
        setPassword("");
        setUsername("");
        setFullName("");
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message === "Invalid login credentials") {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message || "Ocorreu um erro ao tentar fazer login.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao sistema.",
        });
        navigate("/relatorios");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="backdrop-blur-sm bg-white/95 shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LogoDisplay className="mx-auto mb-4" />
          </motion.div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              {isSignUp ? "Criar Conta" : "Bem-vindo"}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {isSignUp ? "Crie sua conta no sistema" : "Acesse sua conta no sistema"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`transition-colors ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:border-primary"
                }`}
                disabled={isLoading}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {isSignUp && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Nome de usuário
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="nomedeusuario"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({ ...errors, username: "" });
                    }}
                    className={`transition-colors ${
                      errors.username 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:border-primary"
                    }`}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nome completo (opcional)
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-gray-300 focus:border-primary transition-colors"
                    disabled={isLoading}
                  />
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: isSignUp ? 0.6 : 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`pr-10 transition-colors ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:border-primary"
                  }`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isSignUp ? 0.7 : 0.5 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-3 text-lg font-medium transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isSignUp ? "Criando..." : "Entrando..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <UserPlus className="h-5 w-5 mr-2" />
                    ) : (
                      <LogIn className="h-5 w-5 mr-2" />
                    )}
                    {isSignUp ? "Criar Conta" : "Entrar"}
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isSignUp ? 0.8 : 0.6 }}
              className="text-center pt-4"
            >
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({ email: "", password: "", username: "" });
                }}
                disabled={isLoading}
                className="text-primary hover:text-primary-dark font-medium"
              >
                {isSignUp ? "Já tem uma conta? Faça login" : "Não tem uma conta? Cadastre-se"}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
