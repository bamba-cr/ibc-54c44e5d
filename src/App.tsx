
import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

import Index from '@/pages/Index';
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

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/editar-aluno/:id" element={<EditarAluno />} />
          <Route path="/frequencia" element={<Frequencia />} />
          <Route path="/consulta-frequencia" element={<ConsultaFrequencia />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/student-performance/:id" element={<StudentPerformance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
      {/* Toast notifications */}
      <Toaster />
      <SonnerToaster />
    </>
  );
}

export default App;
