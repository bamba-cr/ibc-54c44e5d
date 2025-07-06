
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserDashboard } from "@/components/user/UserDashboard";

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </AuthGuard>
  );
};

export default Dashboard;
