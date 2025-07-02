
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  User,
  GraduationCap,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  cpf?: string;
  city: string;
  address: string;
  birth_date: string;
  age?: number;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  photo_url?: string;
  student_projects?: Array<{
    project_id: string;
    projects: {
      name: string;
      code: string;
    };
  }>;
}

interface StudentsListProps {
  students?: Student[];
}

export const StudentsList = ({ students: propStudents }: StudentsListProps) => {
  const navigate = useNavigate();
  
  const { data: queryStudents, isLoading } = useQuery({
    queryKey: ["students-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          student_projects(
            project_id,
            projects(name, code)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !propStudents, // Only fetch if students weren't passed as prop
  });

  // Use prop students if provided, otherwise use query data
  const students = propStudents || queryStudents || [];

  const handleViewPerformance = (studentId: string) => {
    navigate(`/performance/${studentId}`);
  };

  if (!propStudents && isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span>Carregando alunos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum aluno encontrado
            </h3>
            <p className="text-gray-600">
              Não há alunos cadastrados no sistema ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage src={student.photo_url} alt={student.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold text-gray-900 truncate">
                      {student.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {student.city}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                {/* Informações pessoais */}
                <div className="space-y-2">
                  {student.age && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{student.age} anos</span>
                    </div>
                  )}
                  
                  {student.guardian_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="truncate">{student.guardian_name}</span>
                    </div>
                  )}
                  
                  {student.guardian_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{student.guardian_phone}</span>
                    </div>
                  )}
                  
                  {student.guardian_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{student.guardian_email}</span>
                    </div>
                  )}
                </div>

                {/* Projetos */}
                {student.student_projects && student.student_projects.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <GraduationCap className="h-4 w-4" />
                      Projetos:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.student_projects.map((sp, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200"
                        >
                          {sp.projects.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPerformance(student.id)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">
                Total de Alunos: {students.length}
              </span>
            </div>
            <Badge variant="outline" className="bg-white/80 text-blue-700 border-blue-300">
              Atualizado
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
