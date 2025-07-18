
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Alunos from '@/pages/Alunos';
import EditarAluno from '@/pages/EditarAluno';
import Frequencia from '@/pages/Frequencia';
import ConsultaFrequencia from '@/pages/ConsultaFrequencia';
import Notas from '@/pages/Notas';
import Relatorios from '@/pages/Relatorios';
import StudentPerformance from '@/pages/StudentPerformance';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          <Route path="/alunos" element={
            <AuthGuard>
              <Alunos />
            </AuthGuard>
          } />
          <Route path="/editar-aluno/:id" element={
            <AuthGuard>
              <EditarAluno />
            </AuthGuard>
          } />
          <Route path="/frequencia" element={
            <AuthGuard>
              <Frequencia />
            </AuthGuard>
          } />
          <Route path="/consulta-frequencia" element={
            <AuthGuard>
              <ConsultaFrequencia />
            </AuthGuard>
          } />
          <Route path="/notas" element={
            <AuthGuard>
              <Notas />
            </AuthGuard>
          } />
          <Route path="/relatorios" element={
            <AuthGuard requireAdmin={true}>
              <Relatorios />
            </AuthGuard>
          } />
          <Route path="/student-performance/:id" element={
            <AuthGuard>
              <StudentPerformance />
            </AuthGuard>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
      <Toaster />
      <SonnerToaster />
    </AuthProvider>
  );
}

export default App;
