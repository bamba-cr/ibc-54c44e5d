
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Trophy, UserCheck, GraduationCap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface StudentDetails {
  id: string;
  name: string;
  projects: {
    id: string;
    name: string;
    grades: {
      subject: string;
      grade: number;
    }[];
    attendance: {
      present: number;
      total: number;
    };
  }[];
}

interface ProjectRanking {
  student_id: string;
  student_name: string;
  average_grade: number;
  attendance_rate: number;
  grade_rank: number;
  attendance_rank: number;
}

const StudentPerformance = () => {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch projects
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

  // Fetch rankings for selected project
  const { data: rankings, isLoading: isLoadingRankings } = useQuery({
    queryKey: ['rankings', selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const { data, error } = await supabase
        .rpc('get_project_rankings', { project_id_param: selectedProject });
      if (error) throw error;
      return data as ProjectRanking[];
    },
    enabled: !!selectedProject
  });

  // Fetch detailed student info
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
            <Card>
              <CardHeader>
                <CardTitle>Rankings por Projeto</CardTitle>
                <CardDescription>
                  Visualize o desempenho dos alunos em cada projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Projetos</SelectLabel>
                        {projects?.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {isLoadingRankings && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  {rankings && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Melhores Notas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Posição</TableHead>
                                  <TableHead>Aluno</TableHead>
                                  <TableHead>Média</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rankings.map((student) => (
                                  <TableRow key={student.student_id}>
                                    <TableCell>
                                      <Badge variant={student.grade_rank <= 3 ? "default" : "secondary"}>
                                        {student.grade_rank}º
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{student.student_name}</TableCell>
                                    <TableCell>{student.average_grade.toFixed(1)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-green-500" />
                            Maior Frequência
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[400px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Posição</TableHead>
                                  <TableHead>Aluno</TableHead>
                                  <TableHead>Frequência</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rankings.map((student) => (
                                  <TableRow key={student.student_id}>
                                    <TableCell>
                                      <Badge variant={student.attendance_rank <= 3 ? "default" : "secondary"}>
                                        {student.attendance_rank}º
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{student.student_name}</TableCell>
                                    <TableCell>{student.attendance_rate.toFixed(1)}%</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

                  {students && students.map((student) => {
                    const { averageGrade, attendanceRate } = getStudentOverallStats(student.id);
                    return (
                      <Card key={student.id} className="mt-4">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {student.name}
                          </CardTitle>
                          <div className="flex gap-4">
                            <Badge variant="outline">
                              Média Geral: {averageGrade.toFixed(1)}
                            </Badge>
                            <Badge variant="outline">
                              Frequência Geral: {attendanceRate.toFixed(1)}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-2">Projetos Inscritos</h3>
                              <div className="flex flex-wrap gap-2">
                                {student.student_projects.map(({ project }) => (
                                  <Badge key={project.id} variant="secondary">
                                    {project.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold mb-2">Notas por Disciplina</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Disciplina</TableHead>
                                    <TableHead>Nota</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {student.grades.map((grade, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{grade.subject}</TableCell>
                                      <TableCell>{grade.grade.toFixed(1)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

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
