
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
import { ErrorLogsImproved } from '@/components/reports/ErrorLogsImproved';
import { BirthdayStudents } from '@/components/reports/BirthdayStudents';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

const Relatorios = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      console.log('Fetching students data...');
      const { data, error } = await supabase.from("students").select("*");
      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      console.log('Students data fetched:', data);
      return data;
    },
    enabled: !!user && !!profile?.is_admin
  });

  useEffect(() => {
    console.log('Relatorios useEffect - user:', user, 'profile:', profile, 'isLoading:', isLoading);
    
    if (!isLoading && (!user || !profile)) {
      console.log('Redirecting to auth - no user or profile');
      navigate("/auth");
      return;
    }

    if (!isLoading && profile && !profile.is_admin) {
      console.log('Redirecting to dashboard - not admin');
      navigate("/dashboard");
      return;
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    console.log('Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('No user or profile, returning null');
    return null;
  }

  if (!profile.is_admin) {
    console.log('User is not admin');
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Esta página é restrita a administradores.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('Rendering Relatorios page');

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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-[1000px] bg-white shadow-sm">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="admin">Administração</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarSection />
        </TabsContent>

        <TabsContent value="students">
          <div className="space-y-6">
            <BirthdayStudents />
            <StudentsList />
          </div>
        </TabsContent>

        <TabsContent value="reports">
          {studentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ExportSection students={students || []} />
          )}
        </TabsContent>

        <TabsContent value="admin">
          <AdminManagement />
        </TabsContent>

        <TabsContent value="logs">
          <ErrorLogsImproved />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
