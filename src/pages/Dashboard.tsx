
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainDashboard } from '@/components/dashboard/MainDashboard';

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <MainDashboard />
    </ProtectedRoute>
  );
};

export default Dashboard;
