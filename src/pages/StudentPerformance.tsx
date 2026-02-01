import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, GraduationCap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ProjectRankings from '@/components/performance/ProjectRankings';
import StudentDetails from '@/components/performance/StudentDetails';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const StudentPerformance = () => {
  const { id } = useParams();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);

  useEffect(() => {
    // If we have a student ID in the URL, set it as search term
    if (id) {
      setSearchTerm(id);
      setSearchInitiated(true);
    }
  }, [id]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      if (error) {
        toast.error(`Erro ao carregar projetos: ${error.message}`);
        throw error;
      }
      return data;
    }
  });

  const { data: rankings, isLoading: isLoadingRankings } = useQuery({
    queryKey: ['rankings', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const { data, error } = await supabase
        .rpc('get_project_rankings', { project_id_param: selectedProject });
      if (error) {
        toast.error(`Erro ao carregar rankings: ${error.message}`);
        throw error;
      }
      return data;
    },
    enabled: !!selectedProject
  });

  const { data: students, isLoading: isLoadingStudents, error: studentsError } = useQuery({
    queryKey: ['students', searchTerm, searchInitiated],
    queryFn: async () => {
      if (!searchTerm || !searchInitiated) return [];
      
      console.log("Fetching students with search term:", searchTerm);
      
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
          attendance (
            status,
            project_id
          )
        `);

      // Check if searchTerm is a UUID (for direct student ID lookup)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(searchTerm)) {
        query = query.eq('id', searchTerm);
      } else {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error(`Erro ao buscar alunos: ${error.message}`);
        console.error("Error fetching students:", error);
        throw error;
      }
      
      console.log("Students data:", data);
      return data || [];
    },
    enabled: searchInitiated && !!searchTerm
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

  const handleSearch = () => {
    setSearchInitiated(true);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BackToDashboard className="mb-4" />
        
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Pesquisar
                    </button>
                  </div>

                  {studentsError && (
                    <Alert variant="destructive" className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Erro ao buscar alunos: {studentsError.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoadingStudents && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {searchInitiated && !isLoadingStudents && students && students.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Nenhum aluno encontrado com o termo "{searchTerm}"</p>
                    </div>
                  )}

                  {students && students.length > 0 && students.map((student) => (
                    <StudentDetails
                      key={student.id}
                      student={student}
                      stats={getStudentOverallStats(student.id)}
                    />
                  ))}
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
