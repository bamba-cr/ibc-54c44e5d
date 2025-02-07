
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectRankings from '@/components/performance/ProjectRankings';
import StudentDetails from '@/components/performance/StudentDetails';

const StudentPerformance = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: rankings, isLoading: isLoadingRankings } = useQuery({
    queryKey: ['rankings', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const { data, error } = await supabase
        .rpc('get_project_rankings', { project_id_param: selectedProject });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          id,
          name,
          student_projects (
            project:projects (
              id,
              name
            )
          ),
          grades (
            subject,
            grade,
            project_id
          ),
          attendance!inner (
            status,
            project_id
          )
        `);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const getStudentOverallStats = (studentId: string) => {
    if (!students) return { averageGrade: 0, attendanceRate: 0 };

    const student = students.find(s => s.id === studentId);
    if (!student) return { averageGrade: 0, attendanceRate: 0 };

    const grades = student.grades || [];
    const attendance = student.attendance || [];

    const averageGrade = grades.length > 0
      ? grades.reduce((acc, curr) => acc + Number(curr.grade), 0) / grades.length
      : 0;

    const presentCount = attendance.filter(a => a.status === 'presente').length;
    const attendanceRate = attendance.length > 0
      ? (presentCount / attendance.length) * 100
      : 0;

    return { averageGrade, attendanceRate };
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8 text-primary flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Desempenho dos Alunos
        </h1>

        <Tabs defaultValue="rankings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="individual">Consulta Individual</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            <ProjectRankings
              projects={projects}
              rankings={rankings}
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              isLoading={isLoadingRankings}
            />
          </TabsContent>

          <TabsContent value="individual">
            <Card>
              <CardHeader>
                <CardTitle>Consulta Individual</CardTitle>
                <CardDescription>
                  Pesquise por um aluno específico para ver seus detalhes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Digite o nome do aluno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {isLoadingStudents && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {students?.map((student) => (
                    <StudentDetails
                      key={student.id}
                      student={student}
                      stats={getStudentOverallStats(student.id)}
                    />
                  ))}

                  {students?.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhum aluno encontrado com o termo "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default StudentPerformance;
