
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import EditarAluno from "./pages/EditarAluno";
import Frequencia from "./pages/Frequencia";
import Notas from "./pages/Notas";
import Relatorios from "./pages/Relatorios";
import Historico from "./pages/Historico";
import StudentPerformance from "./pages/StudentPerformance";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/editar-aluno" element={<EditarAluno />} />
          <Route path="/frequencia" element={<Frequencia />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/desempenho" element={<StudentPerformance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
