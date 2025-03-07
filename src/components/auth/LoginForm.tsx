
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [errors, setErrors] = useState({ email: "", password: "", username: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = (isSignUp = false) => {
    const newErrors = { email: "", password: "", username: "" };
    let isValid = true;

    if (!email) {
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
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    if (isSignUp && !username) {
      newErrors.username = "Nome de usuário é obrigatório";
      isValid = false;
    } else if (isSignUp && username.length < 3) {
      newErrors.username = "O nome de usuário deve ter pelo menos 3 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error details:", error);
        
        if (error.message === "Invalid login credentials") {
          toast({
            title: "Erro no login",
            description: "Email ou senha incorretos. Se você ainda não tem uma conta, por favor registre-se primeiro.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.",
            variant: "destructive",
          });
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao IBC CONNECT",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }

    if (isRateLimited) {
      toast({
        title: "Aguarde um momento",
        description: "Por favor, aguarde alguns segundos antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsRateLimited(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        if (error.status === 429) {
          toast({
            title: "Muitas tentativas",
            description: "Por favor, aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Cadastro realizado!",
        description: "Por favor, verifique seu email para confirmar o cadastro.",
      });

      // Reset rate limit after 60 seconds
      setTimeout(() => {
        setIsRateLimited(false);
      }, 60000);
      
      // Voltar para a aba de login
      setActiveTab("login");
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary-dark">IBC CONNECT</h1>
        <p className="text-gray-500">Acesse sua conta</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Cadastro</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-login" className="label">
                Email
              </label>
              <Input
                id="email-login"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                required
                className={`input-field ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password-login" className="label">
                Senha
              </label>
              <Input
                id="password-login"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                required
                className={`input-field ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-4">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="label">
                Nome de Usuário
              </label>
              <Input
                id="username"
                type="text"
                placeholder="seunome"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: "" });
                }}
                required
                className={`input-field ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email-signup" className="label">
                Email
              </label>
              <Input
                id="email-signup"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                required
                className={`input-field ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password-signup" className="label">
                Senha
              </label>
              <Input
                id="password-signup"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                required
                className={`input-field ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isRateLimited}
            >
              {isRateLimited ? "Aguarde..." : "Criar conta"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
