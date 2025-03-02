import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Alunos from '@/pages/Alunos';
import EditarAluno from '@/pages/EditarAluno';
import Frequencia from '@/pages/Frequencia';
import ConsultaFrequencia from '@/pages/ConsultaFrequencia';
import Notas from '@/pages/Notas';
import Historico from '@/pages/Historico';
import Relatorios from '@/pages/Relatorios';
import StudentPerformance from '@/pages/StudentPerformance';
import Configuracoes from '@/pages/Configuracoes';
import NotFound from '@/pages/NotFound';

function App() {
  return (
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
        <Route path="/historico" element={<Historico />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/student-performance/:id" element={<StudentPerformance />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
