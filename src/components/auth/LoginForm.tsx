import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual authentication
    if (email === "admin@ibc.com" && password === "admin") {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao IBC CONNECT",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-primary-dark">IBC CONNECT</h1>
        <p className="text-gray-500">Faça login para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="label">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="label">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
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
    </Card>
  );
};