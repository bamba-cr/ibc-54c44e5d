
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Alunos from '@/pages/Alunos';
import EditarAluno from '@/pages/EditarAluno';
import Frequencia from '@/pages/Frequencia';
import ConsultaFrequencia from '@/pages/ConsultaFrequencia';
import Notas from '@/pages/Notas';
import Relatorios from '@/pages/Relatorios';
import StudentPerformance from '@/pages/StudentPerformance';
import NotFound from '@/pages/NotFound';
import RecuperarSenha from '@/pages/RecuperarSenha';
import ResetarSenha from '@/pages/ResetarSenha';
import Historico from '@/pages/Historico';
import Perfil from '@/pages/Perfil';
import { BottomNav } from '@/components/layout/BottomNav';

function App() {
  return (
    <AuthProvider>
      {/* Acessibilidade: link para pular direto ao conteúdo principal */}
      <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
      <Router>
        <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
            <Route path="/resetar-senha" element={<ResetarSenha />} />
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
            <Route path="/student-performance" element={
              <AuthGuard>
                <StudentPerformance />
              </AuthGuard>
            } />
            <Route path="/student-performance/:id" element={
              <AuthGuard>
                <StudentPerformance />
              </AuthGuard>
            } />
            <Route path="/consulta-individual/:id" element={
              <AuthGuard>
                <StudentPerformance />
              </AuthGuard>
            } />
            <Route path="/historico" element={
              <AuthGuard>
                <Historico />
              </AuthGuard>
            } />
            <Route path="/perfil" element={
              <AuthGuard>
                <Perfil />
              </AuthGuard>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
      </Router>
      
      <Toaster />
      <SonnerToaster />
    </AuthProvider>
  );
}

export default App;
