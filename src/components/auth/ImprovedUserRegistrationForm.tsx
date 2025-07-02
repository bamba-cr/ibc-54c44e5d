
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, UserPlus, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserRegistrationFormProps {
  onSuccess?: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  fullName?: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
}

export const ImprovedUserRegistrationForm = ({ onSuccess }: UserRegistrationFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) return "Email é obrigatório";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido";
        break;
      case 'password':
        if (!value) return "Senha é obrigatória";
        if (value.length < 8) return "Senha deve ter pelo menos 8 caracteres";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número";
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) return "Senhas não coincidem";
        break;
      case 'username':
        if (!value.trim()) return "Nome de usuário é obrigatório";
        if (value.length < 3) return "Nome de usuário deve ter pelo menos 3 caracteres";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Nome de usuário deve conter apenas letras, números e underscore";
        }
        break;
      case 'fullName':
        if (!value.trim()) return "Nome completo é obrigatório";
        if (value.length < 2) return "Nome completo deve ter pelo menos 2 caracteres";
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          return "Nome deve conter apenas letras e espaços";
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    // Validação especial para confirmação de senha
    if (field === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
      });

      if (error) {
        if (error.message?.includes("already registered")) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está registrado no sistema.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message || "Ocorreu um erro ao criar a conta.",
            variant: "destructive",
          });
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada e está aguardando aprovação do administrador.",
          className: "border-green-200 bg-green-50",
        });
        
        setTimeout(() => {
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            username: "",
            fullName: "",
          });
          setIsSuccess(false);
          onSuccess?.();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center p-8"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-700 mb-2">Cadastro Realizado!</h2>
        <p className="text-center text-gray-600">
          Sua conta foi criada com sucesso e está aguardando aprovação.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`transition-all duration-200 ${
                  errors.fullName 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              <AnimatePresence>
                {errors.fullName && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {errors.fullName}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Nome de Usuário *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="nomedeusuario"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value.toLowerCase())}
                className={`transition-all duration-200 ${
                  errors.username 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              <AnimatePresence>
                {errors.username && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value.toLowerCase())}
                className={`transition-all duration-200 ${
                  errors.email 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Senha *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`pr-12 transition-all duration-200 ${
                    errors.password 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirmar Senha *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`pr-12 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  }`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key as keyof ValidationErrors])}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
