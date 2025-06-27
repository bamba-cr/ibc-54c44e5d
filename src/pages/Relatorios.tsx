
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CalendarSection } from '@/components/reports/CalendarSection';
import { StudentsList } from '@/components/reports/StudentsList';
import { ExportSection } from '@/components/reports/ExportSection';
import { ErrorLogsImproved } from '@/components/reports/ErrorLogsImproved';
import { useAuth } from '@/hooks/useAuth';

const Relatorios = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  // Se o usuário não é admin, não mostrar certas abas
  const isAdmin = profile?.is_admin || false;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-4xl font-bold mb-8 text-primary border-b pb-4"
      >
        Sistema de Gestão Acadêmica
      </motion.h1>
      
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-3 lg:grid-cols-6 lg:w-[1200px]' : 'grid-cols-2 lg:grid-cols-3 lg:w-[600px]'} bg-white shadow-sm`}>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="admin">Administração</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="calendar">
          <CalendarSection />
        </TabsContent>

        <TabsContent value="students">
          <StudentsList />
        </TabsContent>

        <TabsContent value="reports">
          <ExportSection students={students} />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="logs">
              <ErrorLogsImproved />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Relatorios;
