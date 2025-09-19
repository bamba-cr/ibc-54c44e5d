
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, LogIn, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { sanitizeEmail } from "@/utils/validateCPF";
import { checkRateLimit, logLoginAttempt } from "@/utils/rateLimiter";


export const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetTime: number;
    blocked: boolean;
  } | null>(null);
  const { signIn, isLoading } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Sanitizar email
    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedEmail.trim()) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitizedEmail)) {
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

    const sanitizedEmail = sanitizeEmail(email);
    
    // Verificar rate limiting antes do login
    try {
      const rateLimit = await checkRateLimit(sanitizedEmail, 'login');
      
      if (!rateLimit.allowed) {
        const resetTime = new Date(rateLimit.resetTime);
        const minutes = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60));
        
        setRateLimitInfo({
          remaining: 0,
          resetTime: rateLimit.resetTime,
          blocked: true
        });
        
        toast({
          title: "🚫 Muitas tentativas de login",
          description: `Tente novamente em ${minutes} minutos (${resetTime.toLocaleTimeString()})`,
          variant: "destructive",
        });
        return;
      }
      
      setRateLimitInfo({
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
        blocked: false
      });
    } catch (error) {
      console.error('Erro ao verificar rate limit:', error);
    }

    if (rememberMe) {
      localStorage.setItem("remember_me", sanitizedEmail);
    } else {
      localStorage.removeItem("remember_me");
    }

    const { error } = await signIn(sanitizedEmail, password);

    if (error) {
      // Registrar tentativa falhada
      await logLoginAttempt(sanitizedEmail, false);
      
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
      // Registrar tentativa bem-sucedida
      await logLoginAttempt(sanitizedEmail, true);
      
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
            setEmail(sanitizeEmail(e.target.value));
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          maxLength={254}
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

      <div className="space-y-3">
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
        
        {rateLimitInfo && !rateLimitInfo.blocked && rateLimitInfo.remaining < 3 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <Shield className="h-4 w-4" />
            Restam {rateLimitInfo.remaining} tentativas
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || (rateLimitInfo?.blocked || false)}
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
