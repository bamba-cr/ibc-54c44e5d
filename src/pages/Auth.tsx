
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthGuard } from "@/components/auth/AuthGuard";

const Auth = () => {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-primary p-4">
        <AuthCard />
      </div>
    </AuthGuard>
  );
};

export default Auth;
