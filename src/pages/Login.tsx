
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from "@/components/auth/LoginForm";

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
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary p-4">
      <LoginForm />
    </div>
  );
};

export default Login;
