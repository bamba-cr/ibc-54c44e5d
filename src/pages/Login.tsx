import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GraduationCap } from 'lucide-react';

const Login = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent neon-glow" aria-hidden="true"></div>
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} 
      />
      
      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-manrope font-bold text-xl text-foreground">IBC CONNECT</span>
        </div>
        <ThemeToggle />
      </header>
      
      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
