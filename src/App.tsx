
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ImprovedLogin from "./pages/ImprovedLogin";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import EditarAluno from "./pages/EditarAluno";
import Frequencia from "./pages/Frequencia";
import ConsultaFrequencia from "./pages/ConsultaFrequencia";
import Notas from "./pages/Notas";
import Relatorios from "./pages/Relatorios";
import RelatoriosImproved from "./pages/RelatoriosImproved";
import ImprovedRelatorios from "./pages/ImprovedRelatorios";
import Historico from "./pages/Historico";
import Configuracoes from "./pages/Configuracoes";
import StudentPerformance from "./pages/StudentPerformance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login-improved" element={<ImprovedLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/alunos/editar/:id" element={<EditarAluno />} />
            <Route path="/frequencia" element={<Frequencia />} />
            <Route path="/consulta-frequencia" element={<ConsultaFrequencia />} />
            <Route path="/notas" element={<Notas />} />
            <Route path="/relatorios" element={<ImprovedRelatorios />} />
            <Route path="/relatorios-improved" element={<ImprovedRelatorios />} />
            <Route path="/relatorios-old" element={<Relatorios />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/performance/:id" element={<StudentPerformance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
