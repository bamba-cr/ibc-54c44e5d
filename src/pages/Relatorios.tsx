
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminManagement } from '@/components/reports/AdminManagement';
import { CalendarSection } from '@/components/reports/CalendarSection';
import { StudentsList } from '@/components/reports/StudentsList';
import { ExportSection } from '@/components/reports/ExportSection';

const Relatorios = () => {
  const navigate = useNavigate();

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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px] bg-white shadow-sm">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="admin">Administração</TabsTrigger>
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

        <TabsContent value="admin">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
