
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";


export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { signIn, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
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
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (rememberMe) {
      localStorage.setItem("remember_me", "1");
    } else {
      localStorage.removeItem("remember_me");
    }

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message === "Invalid login credentials") {
        toast({
          title: "Credenciais inválidas",
          description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
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
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao IBC CONNECT",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          className={errors.email ? "border-red-500" : ""}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Senha</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
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
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            disabled={isLoading}
          />
          <Label htmlFor="remember">Lembrar-me</Label>
        </div>
        <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </>
        )}
      </Button>

    </form>
  );
};
